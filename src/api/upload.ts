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
};
