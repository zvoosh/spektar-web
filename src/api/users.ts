import api from "./axios";
import type { User } from "@/types";

export const usersApi = {
  getMe: async () => {
    const res = await api.get<User>("/users/me");
    return res.data;
  },

  updateMe: async (data: {
    username?: string;
    displayName?: string;
    location?: string;
    bio?: string;
    avatar?: string;
    banner?: string;
    notificationPrefs?: Partial<{ comments: boolean; upvotes: boolean; friends: boolean; messages: boolean }>;
  }) => {
    const res = await api.patch<User>("/users/me", data);
    return res.data;
  },

  search: async (q: string, excludeSelf = false) => {
    const params = new URLSearchParams({ q });
    if (excludeSelf) params.set('excludeSelf', 'true');
    const res = await api.get<User[]>(`/users/search?${params}`);
    return res.data;
  },

  getByUsername: async (username: string) => {
    const res = await api.get<User>(`/users/${username}`);
    return res.data;
  },

  getStats: async (): Promise<{ totalUsers: number; activeToday: number }> => {
    const res = await api.get('/users/stats');
    return res.data;
  },
};
