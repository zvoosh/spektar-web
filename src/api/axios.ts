import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes("/auth/");
    const hadToken = !!localStorage.getItem("token");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      // Redirect na login samo ako je korisnik prethodno bio ulogovan
      // (token je postojao). Gosti koji pristupaju javnim rutama bez tokena
      // ne treba da budu redirectovani.
      if (hadToken) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
