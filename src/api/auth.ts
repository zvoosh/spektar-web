import type { User } from "@/types";
import api from "./axios";

export const authApi = {
  register: async (data: { username: string; email: string; password: string }) => {
    const res = await api.post<{ user: User; token: string }>("/auth/register", data);
    return res.data;
  },

  login: async (data: { email: string; password: string; deviceToken?: string }) => {
    const res = await api.post<
      | { user: User; token: string }
      | { requiresTwoFactor: true; userId: string; tempToken: string }
    >("/auth/login", data);
    return res.data;
  },

  me: async () => {
    const res = await api.get<User>("/auth/me");
    return res.data;
  },

  // ─── 2FA ───────────────────────────────────────────────────────────────────

  generate2FA: async () => {
    const res = await api.post<{ secret: string; qrCodeDataUrl: string }>("/auth/2fa/generate");
    return res.data;
  },

  enable2FA: async (code: string) => {
    const res = await api.post<{ message: string }>("/auth/2fa/enable", { code });
    return res.data;
  },

  disable2FA: async (code: string) => {
    const res = await api.post<{ message: string }>("/auth/2fa/disable", { code });
    return res.data;
  },

  verifyTwoFactor: async (tempToken: string, code: string, rememberDevice?: boolean) => {
    const res = await api.post<{ user: User; token: string; deviceToken?: string }>("/auth/2fa/verify", { tempToken, code, rememberDevice });
    return res.data;
  },

  // ─── Forgot / Reset Password ───────────────────────────────────────────────

  forgotPassword: async (email: string) => {
    const res = await api.post<{ message: string }>("/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (token: string, password: string) => {
    const res = await api.post<{ message: string }>("/auth/reset-password", { token, password });
    return res.data;
  },
};
