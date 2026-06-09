import api from "./axios";


export const notificationsApi = {
  getAll: async (page = 1) => {
    const res = await api.get(`/notifications?page=${page}`);
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await api.get<number>("/notifications/unread-count");
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch("/notifications/read-all");
    return res.data;
  },

  clearAll: async () => {
    const res = await api.delete("/notifications");
    return res.data;
  },
};
