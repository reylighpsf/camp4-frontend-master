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

  return user.role === "member";
};

export default function useActiveMembers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    error,
    refetch: fetchMembers,
  };
}
