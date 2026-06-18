import { useCallback, useEffect, useState } from "react";
import api from "@/components/auth/hooks/authApi";

const emptyDashboard = {
  statCards: [
    { label: "Member Sedang Tap In", value: "0", caption: "DI DALAM GYM", icon: "users" },
    { label: "Total Berita", value: "0", caption: "DIPUBLIKASIKAN", icon: "news" },
    { label: "Total Member", value: "0", caption: "AKTIF", icon: "members" },
    { label: "Total Trainer", value: "0", caption: "AKTIF", icon: "trainer" },
  ],
  trainers: [],
  payments: [],
  activities: [],
  transactionsChart: [],
  news: [],
};

const getPayload = (response) => response?.data?.data || response?.data || {};
const formatNumber = (value) => String(value ?? 0);
const formatCurrency = (value) => Number(value || 0).toLocaleString("id-ID");

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const activityLabels = {
  transaction: "Pembayaran berhasil",
  "tap-in": "Member tap in",
  "tap-out": "Member tap out",
  registration: "Member baru terdaftar",
};

const normalizeSummary = (counts = {}, membersTapIn = 0) => [
  {
    label: "Member Sedang Tap In",
    value: formatNumber(membersTapIn),
    caption: "DI DALAM GYM",
    icon: "users",
  },
  {
    label: "Total Berita",
    value: formatNumber(counts.total_news),
    caption: "DIPUBLIKASIKAN",
    icon: "news",
  },
  {
    label: "Total Member",
    value: formatNumber(counts.active_members_with_membership),
    caption: "MEMBERSHIP AKTIF",
    icon: "members",
  },
  {
    label: "Total Trainer",
    value: formatNumber(counts.total_trainers),
    caption: "AKTIF",
    icon: "trainer",
  },
];

const normalizeTrainers = (payload) => {
  const trainers = Array.isArray(payload) ? payload : payload.top_trainers || [];
  return trainers.slice(0, 3).map((trainer) => {
    const name = trainer.name || trainer.full_name || trainer.trainer_name || "Trainer";
    const bookingCount = trainer.total_booking ?? trainer.member_count ?? trainer.members_count ?? 0;
    return {
      name,
      imageUrl: trainer.image_url || "",
      meta: `${bookingCount} booking`,
    };
  });
};

const normalizePayments = (payload) => {
  const payments = Array.isArray(payload) ? payload : payload.latest_transactions || [];
  return payments.slice(0, 5).map((payment) => {
    const name = payment.name || payment.member_name || payment.user?.name || "-";
    const role = payment.role || payment.user?.role || "Member";
    const status = payment.status || payment.payment_status || "SUCCESS";
    const amount = payment.amount || payment.total || payment.price || 0;
    return [name, role, status, formatCurrency(amount)];
  });
};

const normalizeActivities = (payload) => {
  const activities = Array.isArray(payload) ? payload : payload.latest_activities || [];
  const colors = ["#ffd76a", "#a7f36f", "#ffbd4a", "#ffd76a"];

  return activities.slice(0, 4).map((activity, index) => {
    const label = activityLabels[activity.type] || activity.text || activity.message || "Aktivitas";
    const name = activity.name ? ` - ${activity.name}` : "";
    const amount = activity.amount ? ` (Rp${formatCurrency(activity.amount)})` : "";
    const text = activity.description || `${label}${name}${amount}`;
    const time = formatDateTime(activity.time || activity.created_at);
    const color = activity.color || colors[index % colors.length];
    return [text, time, color];
  });
};

const normalizeTransactionsChart = (payload) => {
  const chart = Array.isArray(payload) ? payload : payload.transactions_chart || [];
  return chart.map((item) => ({
    date: item.date,
    totalAmount: Number(item.total_amount || item.totalAmount || 0),
  }));
};

const normalizeNews = (payload) => {
  const news = Array.isArray(payload) ? payload : payload.latest_news || [];
  return news.slice(0, 3).map((item) => ({
    id: item.id,
    title: item.title,
    imageUrl: item.image_url || "",
  }));
};

export default function useAdminDashboard() {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [response, crowdResponse] = await Promise.all([
        api.get("/admin/metrics"),
        api.get("/visits/crowd").catch(() => null),
      ]);
      const payload = getPayload(response);
      const membersTapIn = Number(
        crowdResponse?.data?.data?.count ??
        payload.counts?.members_tap_in ??
        0
      );

      setDashboard({
        statCards: normalizeSummary(payload.counts, membersTapIn),
        trainers: normalizeTrainers(payload),
        payments: normalizePayments(payload),
        activities: normalizeActivities(payload),
        transactionsChart: normalizeTransactionsChart(payload),
        news: normalizeNews(payload),
      });
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
