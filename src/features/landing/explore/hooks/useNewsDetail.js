import { useCallback, useEffect, useState } from "react";
import api from "../../../../../services/authApi.js";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/api\/?$/, "");

const resolveImageUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
};

export default function useNewsDetail(id) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/news/${id}`);
      const item = data?.data || data;
      setNews({
        ...item,
        imageUrl: resolveImageUrl(item.image_url || item.image),
        date: item.created_at || item.date || new Date().toISOString()
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load news detail");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { news, loading, error };
}
