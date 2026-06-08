import api from "./axios";

export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<{ url: string }>("/users/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  },

  uploadFile: async (file: File): Promise<{ url: string; name: string; size: number; mimeType: string }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<{ url: string; name: string; size: number; mimeType: string }>(
      "/users/upload-file",
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  },
};
