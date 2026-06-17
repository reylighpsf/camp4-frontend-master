import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/authApi";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/api\/?$/, "");

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const resolveImageUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
};

const normalizeNewsItem = (item) => ({
  id: item.id || item.news_id || item.title,
  fromApi: true,
  tag: item.category || item.type || "News",
  title: item.title || "Untitled News",
  text: item.summary || item.content || item.description || "",
  imageUrl: resolveImageUrl(item.image_url || item.imageUrl || item.image || ""),
  author: item.author || "",
  createdAt: item.created_at || item.createdAt || "",
});

export default function useExploreNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/news");
      const rawNews = response.data?.data || response.data || [];
      setNews(Array.isArray(rawNews) ? rawNews.map(normalizeNewsItem) : []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat news."));
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchNews, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchNews]);

  const filters = useMemo(() => {
    const tags = news.map((item) => item.tag).filter(Boolean);
    return ["All", ...new Set(tags)];
  }, [news]);

  const filteredNews = useMemo(() => {
    if (activeFilter === "All") return news;
    return news.filter((item) => item.tag === activeFilter);
  }, [activeFilter, news]);

  return {
    news,
    filteredNews,
    filters,
    activeFilter,
    loading,
    error,
    setActiveFilter,
    refetch: fetchNews,
  };
}
