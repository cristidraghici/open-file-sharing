import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ofs_token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error?.response?.status === 401) {
      // Optionally handle token expiry
      // localStorage.removeItem('ofs_token');
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  login: "/auth/login",
  me: "/auth/me",
  mediaUpload: "/api/media/upload",
  mediaList: "/api/media",
  mediaById: (id: string) => `/api/media/${id}`,
  mediaContentById: (id: string) => `/api/media/${id}/content`,
};
