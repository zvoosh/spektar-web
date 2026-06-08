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

  search: async (q: string) => {
    const res = await api.get<Community[]>(`/communities/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },

  getMembers: async (id: string) => {
    const res = await api.get(`/communities/${id}/members`);
    return res.data;
  },

  directAddMember: async (communityId: string, userId: string) => {
    const res = await api.post(`/communities/${communityId}/add-member/${userId}`);
    return res.data;
  },

  getPendingGallery: async (communityId: string) => {
    const res = await api.get(`/communities/${communityId}/gallery/pending`);
    return res.data;
  },

  approveGalleryImage: async (imageId: string) => {
    const res = await api.patch(`/communities/gallery/${imageId}/approve`);
    return res.data;
  },

  rejectGalleryImage: async (imageId: string) => {
    const res = await api.patch(`/communities/gallery/${imageId}/reject`);
    return res.data;
  },

  setMemberRole: async (communityId: string, userId: string, role: 'moderator' | 'member') => {
    const res = await api.patch(`/communities/${communityId}/members/${userId}/role`, { role });
    return res.data;
  },

  getMyRole: async (communityId: string) => {
    const res = await api.get<{ role: string } | string>(`/communities/${communityId}/my-role`);
    return res.data;
  },

  update: async (id: string, data: { name?: string; description?: string; location?: string; avatar?: string }) => {
    const res = await api.patch(`/communities/${id}`, data);
    return res.data;
  },

  updateBanner: async (id: string, bannerUrl: string) => {
    const res = await api.patch(`/communities/${id}/banner`, { bannerUrl });
    return res.data;
  },

  getTrendingTags: async () => {
    const res = await api.get<{ tag: string; count: number }[]>('/communities/meta/trending-tags');
    return res.data;
  },

  getUpcomingEvents: async () => {
    const res = await api.get<{ id: string; title: string; eventDate: string; eventLocation?: string; communityName: string; communitySlug: string }[]>('/communities/meta/upcoming-events');
    return res.data;
  },

  deleteCommunity: async (id: string) => {
    const res = await api.delete(`/communities/${id}`);
    return res.data;
  },

  leaveCommunity: async (communityId: string, newOwnerId?: string) => {
    const res = await api.delete(`/communities/${communityId}/leave`, {
      data: newOwnerId ? { newOwnerId } : {},
    });
    return res.data;
  },

  acceptInvite: async (communityId: string) => {
    const res = await api.post(`/communities/${communityId}/accept-invite`);
    return res.data;
  },

  rejectInvite: async (communityId: string) => {
    const res = await api.post(`/communities/${communityId}/reject-invite`);
    return res.data;
  },

  kickMember: async (communityId: string, userId: string) => {
    const res = await api.delete(`/communities/${communityId}/members/${userId}/kick`);
    return res.data;
  },

  banMember: async (communityId: string, userId: string) => {
    const res = await api.post(`/communities/${communityId}/members/${userId}/ban`);
    return res.data;
  },

  unbanMember: async (communityId: string, userId: string) => {
    const res = await api.delete(`/communities/${communityId}/members/${userId}/ban`);
    return res.data;
  },
};
