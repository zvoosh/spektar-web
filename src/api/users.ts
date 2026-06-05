import api from "./axios";
import type { User } from "@/types";

export const usersApi = {
  getMe: async () => {
    const res = await api.get<User>("/users/me");
    return res.data;
  },

  updateMe: async (data: { bio?: string; avatar?: string; banner?: string }) => {
    const res = await api.patch<User>("/users/me", data);
    return res.data;
  },

  search: async (q: string) => {
    const res = await api.get<User[]>(`/users/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },

  getByUsername: async (username: string) => {
    const res = await api.get<User>(`/users/${username}`);
    return res.data;
  },
};
