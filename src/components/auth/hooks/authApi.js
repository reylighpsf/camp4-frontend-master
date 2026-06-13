import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const withTurnstile = (turnstileToken, config = {}) => ({
  ...config,
  headers: {
    ...(config.headers || {}),
    ...(turnstileToken ? { "X-Turnstile-Token": turnstileToken } : {}),
  },
});

export const authApi = {
  googleConfig: () => api.get("/auth/google-config"),
  signup: (data, turnstileToken = "") =>
    api.post("/auth/register", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(turnstileToken ? { "X-Turnstile-Token": turnstileToken } : {}),
      },
    }),
  signin: (data, turnstileToken = "") => api.post("/auth/login", data, withTurnstile(turnstileToken)),
  registerGoogle: (data) =>
    data instanceof FormData
      ? api.post("/auth/register/google", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      : api.post("/auth/register/google", data),
  loginGoogle: (data) => api.post("/auth/login/google", data),
  resendVerificationEmail: (data, turnstileToken = "") =>
    api.post("/auth/register/resend", data, withTurnstile(turnstileToken)),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  me: () => api.get("/users/me"),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (data, turnstileToken = "") => api.post("/auth/forgot-password", data, withTurnstile(turnstileToken)),
  resendForgotPassword: (data, turnstileToken = "") =>
    api.post("/auth/forgot-password/resend", data, withTurnstile(turnstileToken)),
  resetPassword: (data, turnstileToken = "") =>
    api.post("/auth/forgot-password/reset", data, withTurnstile(turnstileToken)),
};

export default api;
