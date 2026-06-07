import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../../../components/auth/authApi";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const isToday = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const getCheckInTime = (user) =>
  user.check_in_at ||
  user.last_check_in_at ||
  user.latest_check_in_at ||
  user.visit?.check_in_at ||
  user.current_visit?.check_in_at;

const getTransactionTime = (transaction) =>
  transaction?.settled_at ||
  transaction?.confirmed_at ||
  transaction?.created_at ||
  "";

const getLatestMembershipPlansByUser = (transactions = []) => {
  const latestPlans = new Map();

  transactions
    .filter((transaction) => {
      const family = String(transaction.transaction_family || "").toUpperCase();
      const type = String(transaction.transaction_type || "").toUpperCase();
      return transaction.user_id && transaction.status === "SUCCESS" && (family === "MEMBERSHIP" || type.includes("MEMBERSHIP"));
    })
    .forEach((transaction) => {
      const current = latestPlans.get(transaction.user_id);
      const currentTime = new Date(getTransactionTime(current)).getTime() || 0;
      const nextTime = new Date(getTransactionTime(transaction)).getTime() || 0;

      if (!current || nextTime >= currentTime) {
        latestPlans.set(transaction.user_id, transaction.catalog_name || transaction.transaction_type || "");
      }
    });

  return latestPlans;
};

export default function useActiveMembers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let response;
      try {
        response = await api.get("/admin/active-members", {
          params: { page: 1, limit: 100 },
        });
      } catch (err) {
        if (err.response?.status !== 404) throw err;
        response = await api.get("/admin/users", {
          params: { page: 1, limit: 100 },
        });
      }

      const historyResponse = await api.get("/transactions/history", {
        params: { page: 1, limit: 100 },
      }).catch(() => null);
      const plansByUser = getLatestMembershipPlansByUser(historyResponse?.data?.data || []);
      const nextUsers = (response.data?.data || []).map((user) => ({
        ...user,
        membership_plan_name: user.membership_plan_name || plansByUser.get(user.id) || "",
      }));

      setUsers(nextUsers);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat data member."));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMembership = useCallback(async ({ userId, membershipPriceCode }) => {
    setActionLoadingId(userId);
    setActionError("");
    setActionSuccessMessage("");

    try {
      await api.put(`/admin/users/${userId}`, { membershipPriceCode });
      setActionSuccessMessage("Tier membership berhasil diperbarui.");
      await fetchMembers();
      return { ok: true };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal memperbarui tier membership.");
      setActionError(message);
      return { ok: false, error: message };
    } finally {
      setActionLoadingId("");
    }
  }, [fetchMembers]);

  const deleteMembership = useCallback(async (userId) => {
    setActionLoadingId(userId);
    setActionError("");
    setActionSuccessMessage("");

    try {
      await api.delete(`/admin/users/${userId}`);
      setActionSuccessMessage("Member berhasil dihapus.");
      await fetchMembers();
      return { ok: true };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal menghapus member.");
      setActionError(message);
      return { ok: false, error: message };
    } finally {
      setActionLoadingId("");
    }
  }, [fetchMembers]);

  const getUserDetail = useCallback(async (userId) => {
    setActionLoadingId(userId);
    setActionError("");

    try {
      const response = await api.get(`/admin/users/${userId}`);
      return { ok: true, data: response.data?.data || null };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal memuat detail user.");
      setActionError(message);
      return { ok: false, error: message };
    } finally {
      setActionLoadingId("");
    }
  }, []);

  const createUser = useCallback(async (values) => {
    setActionLoadingId("create-user");
    setActionError("");
    setActionSuccessMessage("");

    const formData = new FormData();
    formData.append("email", values.email.trim());
    formData.append("fullName", values.fullName.trim());
    formData.append("password", values.password);
    formData.append("role", values.role);
    formData.append("membershipPriceCode", values.membershipPriceCode);
    formData.append("penaltyAmount", values.penaltyAmount || "0");
    if (values.image) formData.append("image", values.image);

    try {
      const response = await api.post("/admin/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setActionSuccessMessage("User berhasil ditambahkan.");
      await fetchMembers();
      return { ok: true, data: response.data?.data || null };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal menambahkan user.");
      setActionError(message);
      return { ok: false, error: message };
    } finally {
      setActionLoadingId("");
    }
  }, [fetchMembers]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchMembers, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchMembers]);

  const members = useMemo(() => users.filter((user) => user.role === "member"), [users]);

  const summary = useMemo(
    () => {
      const todayCheckIns = members.filter((member) => isToday(getCheckInTime(member)));

      return {
        activeMembers: members.filter((member) => member.is_currently_checked_in).length,
        checkInsToday: todayCheckIns.length,
        registeredMembers: members.length,
      };
    },
    [members],
  );

  return {
    members,
    summary,
    loading,
    actionLoadingId,
    error,
    actionError,
    actionSuccessMessage,
    refetch: fetchMembers,
    getUserDetail,
    createUser,
    updateMembership,
    deleteMembership,
  };
}
