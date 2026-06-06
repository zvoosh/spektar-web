import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import type { Message } from "@/types";

export const useChat = (conversationId: string | null) => {
  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL ?? "http://localhost:3000", {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("newMessage", (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("userTyping", ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    });

    socket.on("userStopTyping", ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.on("messageDeleted", ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
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
      socketRef.current.emit("sendMessage", { conversationId, content, replyToId, imageUrl });
    },
    [conversationId]
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
    setMessages,
    typingUsers,
    connected,
    sendMessage,
    sendTyping,
    sendStopTyping,
    deleteMessage,
    markAsRead,
  };
};
