import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      // No login page to bounce to: drop the stale identity and reload at "/"
      // so AuthContext's bootstrap mints a fresh guest session automatically.
      localStorage.removeItem("tt_token");
      localStorage.removeItem("tt_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
