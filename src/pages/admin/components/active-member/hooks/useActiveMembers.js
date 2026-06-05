import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../../../components/auth/authApi";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const hasActiveMembership = (user) => {
  const status = String(user.membership_status || user.status || "").toLowerCase();
  if (["active", "aktif"].includes(status)) return true;
  if (user.is_active_member || user.active_membership) return true;

  const endDate = user.membership_end_date || user.end_date || user.membership?.end_date;
  if (endDate) return new Date(endDate) >= new Date();

  return false;
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
      const response = await api.get("/admin/users", {
        params: { page: 1, limit: 100 },
      });
      setUsers(response.data?.data || []);
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
    () => ({
      activeMembers: members.filter(hasActiveMembership).length,
      registeredMembers: members.length,
    }),
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
