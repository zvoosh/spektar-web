import type { Comment, Post } from "@/types";
import api from "./axios";

export interface PostsPage {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const postsApi = {
  getByCommunity: async (communityId: string, page = 1) => {
    const res = await api.get<PostsPage>(`/posts/community/${communityId}?page=${page}&limit=10`);
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

  getByUser: async (userId: string) => {
    const res = await api.get<Post[]>(`/posts/by-user/${userId}`);
    return res.data;
  },

  getFeed: async (page = 1) => {
    const res = await api.get<PostsPage>(`/posts/feed?page=${page}&limit=10`);
    return res.data;
  },

  getPopular: async (period: 'day' | 'week' | 'month' | 'all' = 'week') => {
    const res = await api.get<Post[]>(`/posts/popular?period=${period}`);
    return res.data;
  },

  search: async (q: string) => {
    const res = await api.get<Post[]>(`/posts/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },
};
