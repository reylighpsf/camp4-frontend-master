import { useCallback, useEffect, useState } from "react";
import api from "../../../components/auth/authApi";

const emptyDashboard = {
  statCards: [
    { label: "Total Pengguna", value: "0", caption: "TERDAFTAR", icon: "users" },
    { label: "Total Berita", value: "0", caption: "DIPUBLIKASIKAN", icon: "news" },
    { label: "Total Member", value: "0", caption: "AKTIF", icon: "members" },
    { label: "Total Trainer", value: "0", caption: "AKTIF", icon: "trainer" },
  ],
  trainers: [],
  payments: [],
  activities: [],
};

const getPayload = (response) => response?.data?.data || response?.data || {};
const formatNumber = (value) => String(value ?? 0);
const formatCurrency = (value) => Number(value || 0).toLocaleString("id-ID");

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const normalizeSummary = (summary = {}) => [
  {
    label: "Total Pengguna",
    value: formatNumber(summary.total_users ?? summary.totalUsers ?? summary.users_count),
    caption: "TERDAFTAR",
    icon: "users",
  },
  {
    label: "Total Berita",
    value: formatNumber(summary.total_news ?? summary.totalNews ?? summary.news_count),
    caption: "DIPUBLIKASIKAN",
    icon: "news",
  },
  {
    label: "Total Member",
    value: formatNumber(summary.active_members ?? summary.activeMembers ?? summary.members_count),
    caption: "AKTIF",
    icon: "members",
  },
  {
    label: "Total Trainer",
    value: formatNumber(summary.active_trainers ?? summary.activeTrainers ?? summary.trainers_count),
    caption: "AKTIF",
    icon: "trainer",
  },
];

const normalizeTrainers = (payload) => {
  const trainers = Array.isArray(payload) ? payload : payload.trainers || payload.top_trainers || [];
  return trainers.slice(0, 3).map((trainer) => {
    const name = trainer.name || trainer.full_name || trainer.trainer_name || "Trainer";
    const memberCount = trainer.member_count ?? trainer.members_count ?? trainer.total_members ?? 0;
    return [name, `${memberCount} member`];
  });
};

const normalizePayments = (payload) => {
  const payments = Array.isArray(payload) ? payload : payload.payments || payload.transactions || [];
  return payments.slice(0, 5).map((payment) => {
    const name = payment.name || payment.member_name || payment.user?.name || "-";
    const role = payment.role || payment.user?.role || "Member";
    const status = payment.status || payment.payment_status || "-";
    const amount = payment.amount || payment.total || payment.price || 0;
    return [name, role, status, formatCurrency(amount)];
  });
};

const normalizeActivities = (payload) => {
  const activities = Array.isArray(payload) ? payload : payload.activities || payload.recent_activities || [];
  const colors = ["#ffd76a", "#a7f36f", "#ffbd4a", "#ffd76a"];

  return activities.slice(0, 4).map((activity, index) => {
    const text = activity.text || activity.message || activity.description || "-";
    const time = activity.time || activity.created_at_text || activity.relative_time || activity.created_at || "";
    const color = activity.color || colors[index % colors.length];
    return [text, time, color];
  });
};

const getNewsCount = (payload) => {
  if (typeof payload === "number") return payload;
  if (typeof payload === "string") return Number(payload) || 0;
  if (Array.isArray(payload)) return payload.length;
  if (Array.isArray(payload.data)) return payload.data.length;
  if (Array.isArray(payload.news)) return payload.news.length;
  if (Array.isArray(payload.items)) return payload.items.length;
  if (Array.isArray(payload.results)) return payload.results.length;

  if (payload.data && typeof payload.data === "object") return getNewsCount(payload.data);
  if (payload.meta && typeof payload.meta === "object") return getNewsCount(payload.meta);

  return (
    payload.total ??
    payload.total_count ??
    payload.totalCount ??
    payload.total_news ??
    payload.totalNews ??
    payload.news_count ??
    payload.newsCount ??
    payload.count ??
    0
  );
};

const updateStatCardValue = (statCards, label, value) =>
  statCards.map((card) => (card.label === label ? { ...card, value: formatNumber(value) } : card));

export default function useAdminDashboard() {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        summaryResult,
        trainersResult,
        paymentsResult,
        activitiesResult,
        newsCountResult,
      ] = await Promise.allSettled([
        api.get("/admin/dashboard/summary"),
        api.get("/trainers"),
        api.get("/admin/payments"),
        api.get("/admin/dashboard/recent-activities"),
        api.get("/admin/news/count").catch(() => api.get("/news/count")),
      ]);

      const nextDashboard = { ...emptyDashboard };

      if (summaryResult.status === "fulfilled") {
        nextDashboard.statCards = normalizeSummary(getPayload(summaryResult.value));
      }

      if (trainersResult.status === "fulfilled") {
        const trainers = normalizeTrainers(getPayload(trainersResult.value));
        nextDashboard.trainers = trainers;
      }

      if (paymentsResult.status === "fulfilled") {
        const payments = normalizePayments(getPayload(paymentsResult.value));
        nextDashboard.payments = payments;
      }

      if (activitiesResult.status === "fulfilled") {
        const activities = normalizeActivities(getPayload(activitiesResult.value));
        nextDashboard.activities = activities;
      }

      if (newsCountResult.status === "fulfilled") {
        nextDashboard.statCards = updateStatCardValue(
          nextDashboard.statCards,
          "Total Berita",
          getNewsCount(getPayload(newsCountResult.value)),
        );
      }

      const rejected = [
        summaryResult,
        trainersResult,
        paymentsResult,
        activitiesResult,
        newsCountResult,
      ].find(
        (result) => result.status === "rejected",
      );

      if (rejected) {
        setError(getErrorMessage(rejected.reason, "Sebagian data dashboard gagal dimuat."));
      }

      setDashboard(nextDashboard);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat dashboard admin."));
      setDashboard(emptyDashboard);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchDashboard, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchDashboard]);

  return {
    ...dashboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
