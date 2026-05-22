import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

// AUTO REFRESH
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url.includes("/auth/remove-session") &&
      !original.url.includes("/auth/refresh-token")
    ) {
      original._retry = true;

      try {
        await api.post("/auth/refresh-token");
        return api(original);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(err);
  },
);

export const authApi = {
  signup: (data) => api.post("/auth/local/sign-up", data),
  signin: (data) => api.post("/auth/local/sign-in", data),
  me: () => api.get("/auth/user/me"),
  logout: () => api.delete("/auth/remove-session"),
};

export default api;
