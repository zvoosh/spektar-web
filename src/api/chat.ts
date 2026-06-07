import api from "./axios";
import type { Conversation, Message } from "@/types";

export const chatApi = {
  getConversations: async () => {
    const res = await api.get<Conversation[]>("/chat/conversations");
    return res.data;
  },

  getMessages: async (conversationId: string, page = 1) => {
    const res = await api.get<{ messages: Message[]; total: number }>(
      `/chat/${conversationId}/messages?page=${page}`
    );
    return res.data;
  },

  createDM: async (targetUserId: string) => {
    const res = await api.post<Conversation>(`/chat/dm/${targetUserId}`);
    return res.data;
  },

  createGroup: async (name: string, memberIds: string[]) => {
    const res = await api.post<Conversation>("/chat/group", { name, memberIds });
    return res.data;
  },

  inviteMember: async (conversationId: string, targetUserId: string) => {
    const res = await api.post(`/chat/${conversationId}/invite/${targetUserId}`);
    return res.data;
  },

  deleteMessage: async (messageId: string) => {
    const res = await api.delete(`/chat/messages/${messageId}`);
    return res.data;
  },
};
