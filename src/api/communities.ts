import type { Community } from "@/types";
import api from "./axios";

export const communitiesApi = {
  getAll: async () => {
    const res = await api.get<Community[]>("/communities");
    return res.data;
  },

  getBySlug: async (slug: string) => {
    const res = await api.get<Community>(`/communities/${slug}`);
    return res.data;
  },

  create: async (data: Partial<Community>) => {
    const res = await api.post<Community>("/communities", data);
    return res.data;
  },

  join: async (id: string) => {
    const res = await api.post(`/communities/${id}/join`);
    return res.data;
  },

  getGallery: async (id: string) => {
    const res = await api.get(`/communities/${id}/gallery`);
    return res.data;
  },
};
