import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import type { Conversation, Message } from "@/types";

export const useChat = (conversationId: string | null) => {
  const queryClient = useQueryClient();
  const socket = useSocket(); // shared global socket
  const conversationIdRef = useRef<string | null>(conversationId);
  const deletedIdsRef = useRef<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const connected = socket?.connected ?? false;

  // Drži ref ažurnim
  useEffect(() => {
    conversationIdRef.current = conversationId;
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

  // Attach socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (message: Message) => {
      // Only add messages that belong to the current conversation
      if (message.conversationId !== conversationIdRef.current) return;
      setMessagesFiltered((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    const onUserTyping = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.includes(userId) ? prev : [...prev, userId]);
    };

    const onUserStopTyping = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    };

    const onMessageDeleted = ({ messageId }: { messageId: string }) => {
      deletedIdsRef.current.add(messageId);

      setMessagesFiltered((prev) => {
        const filtered = prev.filter((m) => m.id !== messageId);
        const convId = conversationIdRef.current;
        if (convId) {
          const lastMsg = filtered.length > 0 ? filtered[filtered.length - 1] : null;
          setTimeout(() => {
            queryClient.setQueryData<Conversation[]>(["conversations"], (convs: any) => {
              if (!convs) return convs;
              return convs.map((conv: any) => {
                if (conv.id !== convId) return conv;
                if (lastMsg) {
                  return {
                    ...conv,
                    lastMessage: lastMsg.content || (lastMsg.imageUrl ? "📷 Slika" : ""),
                    lastMessageAt: lastMsg.createdAt,
                  };
                } else {
                  return { ...conv, lastMessage: null, lastMessageAt: null };
                }
              });
            });
          }, 0);
        }
        return filtered;
      });
    };

    // Re-join room on reconnect (server forgets rooms after disconnect)
    const onReconnect = () => {
      if (conversationIdRef.current) {
        socket.emit("joinConversation", { conversationId: conversationIdRef.current });
      }
    };

    socket.on("newMessage", onNewMessage);
    socket.on("userTyping", onUserTyping);
    socket.on("userStopTyping", onUserStopTyping);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("connect", onReconnect);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("userTyping", onUserTyping);
      socket.off("userStopTyping", onUserStopTyping);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("connect", onReconnect);
    };
  }, [socket]);

  // Join conversation room when conversationId changes
  useEffect(() => {
    if (!conversationId || !socket) return;
    setMessages([]);
    setTypingUsers([]);
    socket.emit("joinConversation", { conversationId });
  }, [conversationId, socket]);

  const sendMessage = useCallback(
    (content: string, replyToId?: string, imageUrl?: string) => {
      if (!conversationId || !socket) return;
      socket.emit("sendMessage", { conversationId, content, replyToId, imageUrl });
    },
    [conversationId, socket],
  );

  const sendTyping = useCallback(() => {
    if (!conversationId || !socket) return;
    socket.emit("typing", { conversationId });
  }, [conversationId, socket]);

  const sendStopTyping = useCallback(() => {
    if (!conversationId || !socket) return;
    socket.emit("stopTyping", { conversationId });
  }, [conversationId, socket]);

  const deleteMessage = useCallback((messageId: string) => {
    if (!socket) return;
    socket.emit("deleteMessage", { messageId });
  }, [socket]);

  const markAsRead = useCallback(() => {
    if (!conversationId || !socket) return;
    socket.emit("markAsRead", { conversationId });
  }, [conversationId, socket]);

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
