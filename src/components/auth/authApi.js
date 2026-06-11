import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const authApi = {
  googleConfig: () => api.get("/auth/google-config"),
  signup: (data) =>
    api.post("/auth/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  signin: (data) => api.post("/auth/login", data),
  registerGoogle: (data) =>
    api.post("/auth/register/google", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  loginGoogle: (data) => api.post("/auth/login/google", data),
  resendVerificationEmail: (data) => api.post("/auth/register/resend", data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  me: () => api.get("/users/me"),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resendForgotPassword: (data) => api.post("/auth/forgot-password/resend", data),
  resetPassword: (data) => api.post("/auth/forgot-password/reset", data),
};

export default api;
