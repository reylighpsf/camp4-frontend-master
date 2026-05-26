import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:3000/api",
  timeout: 10000, // 10 detik
  withCredentials: true,
});

// "http://localhost:3000/api" + "users" => "http://localhost:3000/api/users"

export const request = async ({ method, url, data, signal }) => {
  try {
    const res = await api({ method, url, data, signal });
    return {
      ok: true,
      data: res.data,
      status: res.status,
    };
  } catch (err) {
    if (axios.isCancel(err)) {
      return { ok: false, error: "Request cancelled", status: 499 };
    }

    const status = err.response?.status || 500;
    const error = err.response?.data?.error || err.message || "Unknown error";

    return { ok: false, error, status };
  }
};
