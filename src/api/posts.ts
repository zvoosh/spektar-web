import type { Comment, Post } from "@/types";
import api from "./axios";

export const postsApi = {
  getByCommunity: async (communityId: string) => {
    const res = await api.get<Post[]>(`/posts/community/${communityId}`);
    return res.data;
  },

  getOne: async (id: string) => {
    const res = await api.get<Post>(`/posts/${id}`);
    return res.data;
  },

  create: async (communityId: string, data: Partial<Post>) => {
    const res = await api.post<Post>(`/posts/community/${communityId}`, data);
    return res.data;
  },

  vote: async (id: string, type: "up" | "down") => {
    const res = await api.post(`/posts/${id}/vote`, { type });
    return res.data;
  },

  toggleSave: async (id: string) => {
    const res = await api.post(`/posts/${id}/save`);
    return res.data;
  },

  share: async (id: string) => {
    const res = await api.post(`/posts/${id}/share`);
    return res.data;
  },

  getSaved: async () => {
    const res = await api.get<Post[]>("/posts/saved");
    return res.data;
  },

  getComments: async (id: string) => {
    const res = await api.get<Comment[]>(`/posts/${id}/comments`);
    return res.data;
  },

  createComment: async (
    id: string,
    data: { body: string; parentId?: string },
  ) => {
    const res = await api.post<Comment>(`/posts/${id}/comments`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },
};
