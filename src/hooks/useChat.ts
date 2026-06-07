import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import type { Conversation, Message } from "@/types";

export const useChat = (conversationId: string | null) => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const conversationIdRef = useRef<string | null>(conversationId);
  const deletedIdsRef = useRef<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  // Drži ref ažurnim
  useEffect(() => {
    conversationIdRef.current = conversationId;
    // Resetuj obrisane ID-ove pri promeni konverzacije
    deletedIdsRef.current = new Set();
  }, [conversationId]);

  // Wrapper koji uvek filtrira lokalno obrisane poruke
  const setMessagesFiltered = useCallback(
    (updater: Message[] | ((prev: Message[]) => Message[])) => {
      setMessages((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return next.filter((m) => !deletedIdsRef.current.has(m.id));
      });
    },
    [],
  );

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL ?? "http://localhost:3000", {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("newMessage", (message: Message) => {
      setMessagesFiltered((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("userTyping", ({ userId }: { userId: string }) => {
      setTypingUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId],
      );
    });

    socket.on("userStopTyping", ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.on("messageDeleted", ({ messageId }: { messageId: string }) => {
      // Zapamti lokalno — sprečava vraćanje poruke čak i ako API vrati stare podatke
      deletedIdsRef.current.add(messageId);

      setMessagesFiltered((prev) => {
        const filtered = prev.filter((m) => m.id !== messageId);

        // Optimistički ažuriraj lastMessage samo za aktivnu konverzaciju
        const convId = conversationIdRef.current;
        if (convId) {
          const lastMsg =
            filtered.length > 0 ? filtered[filtered.length - 1] : null;
          setTimeout(() => {
            queryClient.setQueryData<Conversation[]>(
              ["conversations"],
              (convs: any) => {
                if (!convs) return convs;
                return convs.map((conv: any) => {
                  if (conv.id !== convId) return conv;
                  if (lastMsg) {
                    return {
                      ...conv,
                      lastMessage:
                        lastMsg.content || (lastMsg.imageUrl ? "📷 Slika" : ""),
                      lastMessageAt: lastMsg.createdAt,
                    };
                  } else {
                    return { ...conv, lastMessage: null, lastMessageAt: null };
                  }
                });
              },
            );
          }, 0);
        }

        return filtered;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (!conversationId || !socketRef.current) return;
    setMessages([]);
    setTypingUsers([]);
    socketRef.current.emit("joinConversation", { conversationId });
  }, [conversationId]);

  const sendMessage = useCallback(
    (content: string, replyToId?: string, imageUrl?: string) => {
      if (!conversationId || !socketRef.current) return;
      socketRef.current.emit("sendMessage", {
        conversationId,
        content,
        replyToId,
        imageUrl,
      });
    },
    [conversationId],
  );

  const sendTyping = useCallback(() => {
    if (!conversationId || !socketRef.current) return;
    socketRef.current.emit("typing", { conversationId });
  }, [conversationId]);

  const sendStopTyping = useCallback(() => {
    if (!conversationId || !socketRef.current) return;
    socketRef.current.emit("stopTyping", { conversationId });
  }, [conversationId]);

  const deleteMessage = useCallback((messageId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("deleteMessage", { messageId });
  }, []);

  const markAsRead = useCallback(() => {
    if (!conversationId || !socketRef.current) return;
    socketRef.current.emit("markAsRead", { conversationId });
  }, [conversationId]);

  return {
    messages,
    setMessages: setMessagesFiltered,
    typingUsers,
    connected,
    sendMessage,
    sendTyping,
    sendStopTyping,
    deleteMessage,
    markAsRead,
  };
};
