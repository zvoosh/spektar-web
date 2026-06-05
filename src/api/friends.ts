import api from "./axios";
import type { User } from "@/types";

export interface FriendRequest {
  id: string;
  requesterId: string;
  requester: User;
  createdAt: string;
}

export const friendsApi = {
  sendRequest: async (userId: string) => {
    const res = await api.post(`/friends/request/${userId}`);
    return res.data;
  },
  accept: async (userId: string) => {
    const res = await api.post(`/friends/accept/${userId}`);
    return res.data;
  },
  reject: async (userId: string) => {
    const res = await api.post(`/friends/reject/${userId}`);
    return res.data;
  },
  remove: async (userId: string) => {
    const res = await api.delete(`/friends/${userId}`);
    return res.data;
  },
  getFriends: async () => {
    const res = await api.get<User[]>("/friends");
    return res.data;
  },
  getPendingRequests: async () => {
    const res = await api.get<FriendRequest[]>("/friends/requests");
    return res.data;
  },
  getStatus: async (userId: string) => {
    const res = await api.get<{ status: string; isSender?: boolean }>(`/friends/status/${userId}`);
    return res.data;
  },
  getFriendCount: async (userId: string) => {
    const res = await api.get<number>(`/friends/count/${userId}`);
    return res.data;
  },
};
