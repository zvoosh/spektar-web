import type { User } from "@/types";
import api from "./axios";

export const authApi = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
  }) => {
    const res = await api.post<{ user: User; token: string }>(
      "/auth/register",
      data,
    );
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<{ user: User; token: string }>(
      "/auth/login",
      data,
    );
    return res.data;
  },

  me: async () => {
    const res = await api.get<User>("/auth/me");
    return res.data;
  },
};
