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
  activeVisitors: [],
};

const getPayload = (response) => response?.data?.data || response?.data || {};
const formatNumber = (value) => String(value ?? 0);
const formatCurrency = (value) => Number(value || 0).toLocaleString("id-ID");

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const normalizeSummary = ({ users = [], trainers = [], news = [] } = {}) => [
  {
    label: "Total Pengguna",
    value: formatNumber(users.length),
    caption: "TERDAFTAR",
    icon: "users",
  },
  {
    label: "Total Berita",
    value: formatNumber(news.length),
    caption: "DIPUBLIKASIKAN",
    icon: "news",
  },
  {
    label: "Total Member",
    value: formatNumber(users.filter((user) => user.role === "member").length),
    caption: "TERDAFTAR",
    icon: "members",
  },
  {
    label: "Total Trainer",
    value: formatNumber(trainers.length),
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

export default function useAdminDashboard() {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        usersResult,
        trainersResult,
        paymentsResult,
        newsResult,
        crowdResult,
      ] = await Promise.allSettled([
        api.get("/admin/users", { params: { page: 1, limit: 100 } }),
        api.get("/trainers"),
        api.get("/transactions/cash/pending"),
        api.get("/news"),
        api.get("/visits/crowd"),
      ]);

      const nextDashboard = { ...emptyDashboard };
      const users = usersResult.status === "fulfilled" ? getPayload(usersResult.value) : [];
      const trainersPayload = trainersResult.status === "fulfilled" ? getPayload(trainersResult.value) : [];
      const news = newsResult.status === "fulfilled" ? getPayload(newsResult.value) : [];

      nextDashboard.statCards = normalizeSummary({
        users: Array.isArray(users) ? users : [],
        trainers: Array.isArray(trainersPayload) ? trainersPayload : [],
        news: Array.isArray(news) ? news : [],
      });

      if (trainersResult.status === "fulfilled") {
        const trainers = normalizeTrainers(getPayload(trainersResult.value));
        nextDashboard.trainers = trainers;
      }

      if (paymentsResult.status === "fulfilled") {
        const payments = normalizePayments(getPayload(paymentsResult.value));
        nextDashboard.payments = payments;
      }

      if (crowdResult.status === "fulfilled") {
        const crowd = getPayload(crowdResult.value);
        nextDashboard.activities = normalizeActivities([
          {
            text: `${crowd.count ?? 0} visitors`,
            time: "",
            color: "#ffd76a",
          },
        ]);
        const visitors = crowd.visitors || crowd.activeVisitors || crowd.active_visitors || [];
        nextDashboard.activeVisitors = Array.isArray(visitors)
          ? visitors.map((visitor) => ({
              name: visitor.full_name || visitor.name || visitor.email || "Visitor",
            }))
          : [];
      }

      const rejected = [
        usersResult,
        trainersResult,
        paymentsResult,
        newsResult,
        crowdResult,
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
