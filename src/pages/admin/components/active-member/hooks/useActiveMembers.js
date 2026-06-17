import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/components/auth/hooks/authApi";
import { getResponseList } from "@/utils/responseData";

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
  user.tap_in_time ||
  user.last_check_in_at ||
  user.latest_check_in_at ||
  user.last_tap_in_time ||
  user.visit?.check_in_at ||
  user.visit?.tap_in_time ||
  user.current_visit?.check_in_at ||
  user.current_visit?.tap_in_time;

const getCheckOutTime = (user) =>
  user.check_out_at ||
  user.tap_out_time ||
  user.last_check_out_at ||
  user.latest_check_out_at ||
  user.last_tap_out_time ||
  user.visit?.check_out_at ||
  user.visit?.tap_out_time ||
  user.current_visit?.check_out_at ||
  user.current_visit?.tap_out_time;

const MEMBERSHIP_PLAN_NAMES = {
  MEMBERSHIP_DAILY: "Membership Daily",
  MEMBERSHIP_MONTHLY: "Membership Monthly",
};

const getMembershipPlanName = (user) => {
  const planName =
    user.membership_plan_name ||
    user.membership?.name ||
    user.membership_name ||
    user.plan_name;

  if (planName) return planName;

  const planCode = user.membership?.plan_code;

  if (!planCode) return "";

  return MEMBERSHIP_PLAN_NAMES[String(planCode).toUpperCase()] || String(planCode).replaceAll("_", " ");
};

const isCurrentlyCheckedIn = (user) => {
  if (typeof user.is_currently_checked_in === "boolean") return user.is_currently_checked_in;
  if (typeof user.is_inside_gym === "boolean") return user.is_inside_gym;
  if (String(user.visit_status || "").toUpperCase() === "INSIDE") return true;

  const checkIn = getCheckInTime(user);
  const checkOut = getCheckOutTime(user);
  return Boolean(checkIn && !checkOut);
};

const isMembershipActive = (user) => {
  const status = String(user.membership?.status || "").toUpperCase();
  if (status === "ACTIVE") return true;
  if (status === "EXPIRED" || status === "INACTIVE") return false;

  const endDate = user.membership?.end_date;
  if (!endDate) return false;

  const endTime = new Date(endDate).getTime();
  return Number.isFinite(endTime) && endTime > Date.now();
};

export default function useActiveMembers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");
  const [crowdCount, setCrowdCount] = useState(0);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [response, crowdResponse] = await Promise.all([
        api.get("/admin/users", { params: { page: 1, limit: 100 } }),
        api.get("/visits/crowd").catch(() => null),
      ]);

      const nextUsers = getResponseList(response).map((user) => {
        const isActive = isMembershipActive(user);

        return {
          ...user,
          membership_plan_name: getMembershipPlanName(user),
          check_in_at: getCheckInTime(user),
          check_out_at: getCheckOutTime(user),
          is_currently_checked_in: isCurrentlyCheckedIn(user),
          is_membership_active: isActive,
          membership_status_label: isActive ? "Aktif" : "Tidak Aktif",
        };
      });

      setCrowdCount(Number(crowdResponse?.data?.data?.count || 0));
      setUsers(nextUsers);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat data member."));
      setUsers([]);
      setCrowdCount(0);
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
    if (values.phoneNumber?.trim()) formData.append("phoneNumber", values.phoneNumber.trim());
    if (values.birthDate) formData.append("birthDate", values.birthDate);
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

  const updateUser = useCallback(async (userId, values) => {
    setActionLoadingId(`edit-${userId}`);
    setActionError("");
    setActionSuccessMessage("");

    const formData = new FormData();
    formData.append("fullName", values.fullName.trim());
    formData.append("role", values.role);
    formData.append("membershipPriceCode", values.membershipPriceCode);
    formData.append("penaltyAmount", values.penaltyAmount || "0");
    if (values.phoneNumber?.trim()) formData.append("phoneNumber", values.phoneNumber.trim());
    if (values.birthDate) formData.append("birthDate", values.birthDate);
    if (values.password) formData.append("password", values.password);
    if (values.image) formData.append("image", values.image);

    try {
      const response = await api.put(`/admin/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setActionSuccessMessage("User berhasil diperbarui.");
      await fetchMembers();
      return { ok: true, data: response.data?.data || null };
    } catch (err) {
      const message = getErrorMessage(err, "Gagal memperbarui user.");
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
      const checkedInFromRows = members.filter((member) => member.is_currently_checked_in).length;

      return {
        activeMembers: Math.max(checkedInFromRows, crowdCount),
        checkInsToday: todayCheckIns.length,
        activeMemberships: members.filter((member) => member.is_membership_active).length,
        registeredMembers: members.length,
      };
    },
    [crowdCount, members],
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
    updateUser,
    updateMembership,
    deleteMembership,
  };
}
