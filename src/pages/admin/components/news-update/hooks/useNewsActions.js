import { useCallback, useEffect, useState } from "react";
import api from "../../../../../components/auth/authApi";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const buildNewsPayload = ({ values, image }) => {
  const payload = new FormData();
  payload.append("title", values.title.trim());
  payload.append("content", values.description.trim());
  if (image) payload.append("image", image);
  return payload;
};

export default function useNewsActions() {
  const [news, setNews] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchNews = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const response = await api.get("/news");
      setNews(response.data?.data || []);
    } catch (err) {
      setListError(getErrorMessage(err, "Gagal memuat daftar berita."));
      setNews([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchNews, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchNews]);

  const createNews = async ({ values, image }) => {
    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccessMessage("");
    try {
      const response = await api.post("/news", buildNewsPayload({ values, image }), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitSuccessMessage("Berita berhasil diposting.");
      return { ok: true, data: response.data?.data };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal membuat berita.");
      setSubmitError(message);
      return { ok: false, error: message };
    } finally {
      setSubmitLoading(false);
    }
  };

  const updateNews = async () => {
    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccessMessage("");
    try {
      setSubmitError("Backend belum menyediakan endpoint untuk memperbarui berita.");
      return { ok: false, error: "Backend belum menyediakan endpoint untuk memperbarui berita." };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal memperbarui berita.");
      setSubmitError(message);
      return { ok: false, error: message };
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteNews = async (id) => {
    setDeleteLoadingId(id);
    setDeleteError("");
    try {
      await api.delete(`/news/${id}`);
      return { ok: true };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal menghapus berita.");
      setDeleteError(message);
      return { ok: false, error: message };
    } finally {
      setDeleteLoadingId("");
    }
  };

  return {
    news, listLoading, listError, submitLoading, submitError,
    submitSuccessMessage, deleteLoadingId, deleteError,
    fetchNews, createNews, updateNews, deleteNews,
  };
}
