import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { io } from "socket.io-client";
import MemberLayout from "@/components/member/MemberLayout";
import MemberIcon from "@/components/member/MemberIcon";
import api from "@/components/auth/hooks/authApi";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { getAuthMembershipPlan } from "../../../auth/membership/hooks/authPlans";
import { confirmAction } from "@/utils/sweetAlert";

const tabs = [
  { label: "Account Settings", icon: "profile", section: "account" },
  { label: "Membership Plan", icon: "check", to: "/member/profile/membership" },
  { label: "Security", icon: "check", section: "security" },
  { label: "Notifications", icon: "bell", section: "notifications" },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, "");
const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || "/ws/";
const NOTIFICATION_NAMESPACE = import.meta.env.VITE_NOTIFICATION_SOCKET_NAMESPACE || "/ws/notifications";
const NOTIFICATION_SETTINGS_KEY = "vocafit-notification-settings";
const defaultNotificationSettings = {
  payment: true,
  trainer: false,
  membership: false,
  checkIn: true,
  workout: false,
  news: false,
};

const notificationPreferences = [
  {
    key: "payment",
    title: "Payment Notifications",
    description: "Payment status, QRIS waiting, failed payments, and cash confirmation.",
  },
  {
    key: "trainer",
    title: "Trainer Schedule",
    description: "Trainer bookings, upcoming sessions, and schedule changes.",
  },
  {
    key: "membership",
    title: "Membership Reminders",
    description: "Membership activation, renewal reminders, and expiry alerts.",
  },
  {
    key: "checkIn",
    title: "Check-In Alerts",
    description: "QR check-in, tap-out reminders, and gym visit status.",
  },
  {
    key: "workout",
    title: "Workout Reminders",
    description: "Workout tracking reminders and completed activity updates.",
  },
  {
    key: "news",
    title: "News & Promotions",
    description: "Gym announcements, trainer promos, and new facility updates.",
  },
];

const getPhoneInputDigits = (phoneNumber = "") =>
  phoneNumber.replace(/^\+62/, "").replace(/^0/, "");

const getNotificationCategory = (type) => {
  if (["TRANSACTION_CREATED", "TRANSACTION_SUCCESS", "TRANSACTION_FAILED"].includes(type)) return "payment";
  if (type === "SESSION_REMINDER") return "trainer";
  if (["MEMBERSHIP_EXPIRY_TODAY", "MEMBERSHIP_EXPIRY_TOMORROW"].includes(type)) return "membership";
  if (type === "BROADCAST") return "news";
  return "news";
};

const getStoredNotificationSettings = () => {
  try {
    return {
      ...defaultNotificationSettings,
      ...JSON.parse(localStorage.getItem(NOTIFICATION_SETTINGS_KEY) || "{}"),
    };
  } catch {
    return defaultNotificationSettings;
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatNotificationTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
};

const formatSessionTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
};

const getSessionDeviceLabel = (session) => {
  const device = session.device_type || "Device";
  const agent = String(session.user_agent || "");
  const browser = agent.includes("Chrome")
    ? "Chrome"
    : agent.includes("Firefox")
      ? "Firefox"
      : agent.includes("Safari")
        ? "Safari"
        : "Browser";
  return `${browser} on ${device}`;
};

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const getNotificationErrorMessage = (err) => {
  const status = err.response?.status;
  if (status === 404) return "Endpoint notifikasi belum tersedia di backend yang sedang berjalan.";
  if (status === 401) return "Sesi login sudah habis. Silakan sign in ulang.";
  if (status >= 500) return "Backend notifikasi sedang bermasalah. Pastikan tabel notifications sudah ada di database.";
  return getErrorMessage(err, "Gagal memuat notifikasi.");
};

const getStoredRegistrationPlanId = (profile) => {
  const email = profile?.email;
  if (email) {
    try {
      const savedPlan = JSON.parse(
        localStorage.getItem(`vocafit-registration-plan-${email}`) || "null",
      );
      if (savedPlan?.planId) return savedPlan.planId;
    } catch {
      return "";
    }
  }

  return localStorage.getItem("vocafit-selected-plan") || "";
};

const normalizePlanId = (planId) => {
  const id = String(planId || "").toLowerCase();
  if (id === "monthly") return "premium";
  if (id === "bulanan") return "premium";
  if (id === "harian") return "daily";
  return id;
};

const getMembershipPlanName = (profile, registrationPlanId) => {
  const backendType =
    profile?.membership_plan_id ||
    profile?.membership_plan ||
    profile?.membership_type ||
    profile?.membership?.plan_id ||
    profile?.membership?.plan ||
    profile?.membership?.type ||
    "";
  const normalizedPlanId = normalizePlanId(backendType || registrationPlanId);

  if (normalizedPlanId) {
    return getAuthMembershipPlan(normalizedPlanId).name;
  }

  return "Belum ada membership";
};

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "security" || tab === "notifications") return tab;
    return "account";
  }, [location.search]);
  const [profile, setProfile] = useState(user || null);
  const [formValues, setFormValues] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    phoneNumber: user?.phone_number || "",
    birthDate: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [registrationPlanId, setRegistrationPlanId] = useState("");
  const [notificationSettings, setNotificationSettings] = useState(getStoredNotificationSettings);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/users/me");
        const nextProfile = response.data?.data || null;
        if (!isMounted) return;
        setProfile(nextProfile);
        setFormValues({
          fullName: nextProfile?.full_name || "",
          email: nextProfile?.email || "",
          phoneNumber: nextProfile?.phone_number || nextProfile?.phone || "",
          birthDate: nextProfile?.date_of_birth ? String(nextProfile.date_of_birth).slice(0, 10) : "",
        });
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err, "Gagal memuat profile."));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setRegistrationPlanId(normalizePlanId(getStoredRegistrationPlanId(profile)));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    if (activeSection !== "notifications") return undefined;

    let isMounted = true;

    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError("");

      try {
        const [listResponse, countResponse] = await Promise.all([
          api.get("/notifications", { params: { page: 1, limit: 20 } }),
          api.get("/notifications/unread-count"),
        ]);

        if (!isMounted) return;
        setNotifications(listResponse.data?.data || []);
        setUnreadCount(countResponse.data?.data?.unread_count || 0);
      } catch (err) {
        if (isMounted) setNotificationsError(getNotificationErrorMessage(err));
      } finally {
        if (isMounted) setNotificationsLoading(false);
      }
    };

    fetchNotifications();

    const socket = io(`${SOCKET_URL}${NOTIFICATION_NAMESPACE}`, {
      autoConnect: false,
      path: SOCKET_PATH,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const handleNotification = (payload) => {
      const nextNotification = payload?.data || payload;
      if (!nextNotification?.id) return;

      setNotifications((current) => [
        {
          id: nextNotification.id,
          notification_id: nextNotification.id,
          is_read: false,
          type: nextNotification.type,
          title: nextNotification.title,
          message: nextNotification.message,
          created_at: nextNotification.created_at,
        },
        ...current.filter((item) => item.notification_id !== nextNotification.id && item.id !== nextNotification.id),
      ]);
      setUnreadCount((current) => current + 1);
    };

    socket.on("new_notification", handleNotification);
    socket.connect();

    return () => {
      isMounted = false;
      socket.off("new_notification", handleNotification);
      socket.disconnect();
    };
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "security") return;

    let isMounted = true;
    const fetchSessions = async () => {
      setSessionsLoading(true);
      setSessionsError("");
      try {
        const response = await api.get("/users/sessions");
        if (isMounted) setSessions(response.data?.data || []);
      } catch (err) {
        if (isMounted) setSessionsError(getErrorMessage(err, "Gagal memuat login activity."));
      } finally {
        if (isMounted) setSessionsLoading(false);
      }
    };

    fetchSessions();
    return () => {
      isMounted = false;
    };
  }, [activeSection]);

  const membershipText = useMemo(() => {
    return getMembershipPlanName(profile, registrationPlanId);
  }, [profile, registrationPlanId]);

  const isGoogleAccount = Boolean(profile?.is_google_account || profile?.isGoogleAccount);
  const memberId = profile?.id ? `VF${String(profile.id).slice(0, 10).toUpperCase()}` : "VF1234567890";
  const joinDate = formatDate(profile?.created_at);

  const handleDeleteAccount = async () => {
    const confirmed = await confirmAction({
      confirmButtonColor: "#c73822",
      confirmButtonText: "Ya, Hapus Akun",
      text: "Akun kamu akan dinonaktifkan.",
      title: "Hapus Akun?",
    });
    if (!confirmed) return;

    setDeleting(true);
    setMessage("");
    setError("");

    try {
      await api.delete("/users/me");
      await logout().catch(() => null);
      navigate("/sign-in", {
        replace: true,
        state: { notice: "Akun berhasil dihapus." },
      });
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menghapus akun."));
    } finally {
      setDeleting(false);
    }
  };

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  };

  const toggleNotification = (key) => {
    setNotificationSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const visibleNotifications = useMemo(
    () => notifications.filter((item) => notificationSettings[getNotificationCategory(item.type)]),
    [notificationSettings, notifications],
  );

  const markNotificationsAsRead = async () => {
    if (unreadCount <= 0) return;

    setNotificationsError("");
    try {
      await api.patch("/notifications/read");
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      setNotificationsError(getNotificationErrorMessage(err));
    }
  };

  const revokeSession = async (sessionId) => {
    setSessionsError("");
    try {
      await api.delete(`/users/sessions/${sessionId}`);
      setSessions((current) => current.filter((session) => session.id !== sessionId));
    } catch (err) {
      setSessionsError(getErrorMessage(err, "Gagal menghapus session."));
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    if (!passwordForm.currentPassword.trim()) {
      setSaving(false);
      setError("Password sekarang wajib diisi.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSaving(false);
      setError("Password minimal 6 karakter.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSaving(false);
      setError("Konfirmasi password tidak sama.");
      return;
    }

    try {
      await api.put("/users/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await logout().catch(() => null);
      navigate("/sign-in", {
        replace: true,
        state: { notice: "Password berhasil diperbarui. Silakan sign in ulang." },
      });
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengubah password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <MemberLayout active="Profile">
      <style>{`
        .profile-page {
          display: grid;
          gap: 30px;
          max-width: 1440px;
          width: 100%;
        }

        .profile-title {
          color: #0b0871;
          font-family: 'Anton', sans-serif;
          font-size: 34px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
          margin: 0;
        }

        .profile-tabs {
          align-items: center;
          border-bottom: 1px solid rgba(11, 8, 113, .36);
          display: flex;
          gap: 22px;
          overflow-x: auto;
          padding: 0 4px 10px;
        }

        .profile-tab {
          align-items: center;
          background: transparent;
          border: 0;
          color: #514da5;
          cursor: pointer;
          display: inline-flex;
          flex: 0 0 auto;
          gap: 9px;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          min-height: 32px;
          padding: 0;
          text-decoration: none;
        }

        .profile-tab svg {
          height: 18px;
          width: 18px;
        }

        .profile-tab.is-active {
          color: #ff7a00;
          position: relative;
        }

        .profile-tab.is-active::after {
          background: #ff7a00;
          border-radius: 999px;
          bottom: -11px;
          content: "";
          height: 3px;
          left: 0;
          position: absolute;
          right: 0;
        }

        .profile-grid {
          align-items: stretch;
          display: grid;
          gap: 30px;
          grid-template-columns: minmax(320px, 414px) minmax(0, 1fr);
        }

        .profile-main-column {
          display: grid;
          gap: 22px;
          height: 100%;
        }

        .profile-card,
        .profile-form-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 18px 36px rgba(8, 4, 120, .08);
        }

        .profile-card {
          align-content: start;
          display: grid;
          grid-template-rows: auto auto 1fr auto;
          justify-items: center;
          min-height: 100%;
          padding: 32px 26px 30px;
        }

        .profile-avatar-wrap {
          position: relative;
        }

        .profile-avatar,
        .profile-avatar-image {
          border-radius: 50%;
          height: 136px;
          width: 136px;
        }

        .profile-avatar {
          align-items: center;
          background: #0b0871;
          color: #ffffff;
          display: inline-flex;
          justify-content: center;
          overflow: hidden;
        }

        .profile-avatar svg {
          height: 56px;
          width: 56px;
        }

        .profile-avatar-image {
          display: block;
          object-fit: cover;
        }

        .profile-camera {
          align-items: center;
          background: #ff7a00;
          border: 3px solid #ffffff;
          border-radius: 50%;
          bottom: 4px;
          color: #ffffff;
          display: inline-flex;
          height: 42px;
          justify-content: center;
          position: absolute;
          right: 0;
          width: 42px;
        }

        .profile-camera svg {
          height: 17px;
          width: 17px;
        }

        .profile-google-lock {
          background: #fff8f3;
          border: 1px solid #ffd2b8;
          border-radius: 999px;
          color: #ff6b20;
          display: inline-flex;
          font-size: 11px;
          font-weight: 900;
          line-height: 1;
          margin-top: 12px;
          padding: 8px 12px;
        }

        .profile-name {
          color: #0b0871;
          font-size: 20px;
          font-weight: 900;
          margin-top: 26px;
          text-align: center;
        }

        .profile-role {
          color: #7a7db5;
          font-size: 15px;
          font-weight: 800;
          margin-top: 6px;
          text-align: center;
        }

        .profile-meta-list {
          display: grid;
          gap: 12px;
          margin-top: 38px;
          width: 100%;
        }

        .profile-meta {
          align-items: center;
          background: #f4f5fb;
          border-radius: 8px;
          color: #0b0871;
          display: flex;
          gap: 16px;
          min-height: 72px;
          padding: 14px 18px;
        }

        .profile-meta svg {
          color: #6f72b5;
          flex: 0 0 auto;
          height: 22px;
          width: 22px;
        }

        .profile-meta span {
          color: #8a8cbe;
          display: block;
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 5px;
        }

        .profile-meta strong {
          display: block;
          font-size: 16px;
          font-weight: 900;
          overflow-wrap: anywhere;
        }

        .profile-form-card {
          min-height: 100%;
          padding: 30px;
        }

        .profile-danger-card {
          background: #fffafa;
          border-radius: 10px;
          margin-top: 22px;
          padding: 18px;
          width: 100%;
        }

        .profile-danger-card h2 {
          color: #c73822;
          font-size: 16px;
          font-weight: 900;
          margin: 0 0 8px;
        }

        .profile-danger-card p {
          color: #6f7285;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.4;
          margin: 0 0 14px;
        }

        .profile-form-card h2 {
          color: #0b0871;
          font-size: 20px;
          font-weight: 900;
          margin: 0 0 28px;
        }

        .profile-form {
          display: grid;
          gap: 26px;
        }

        .profile-form-grid {
          display: grid;
          gap: 20px 20px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .profile-field {
          color: #0b0871;
          display: grid;
          gap: 10px;
          font-size: 16px;
          font-weight: 900;
        }

        .profile-field.is-wide {
          grid-column: 1 / -1;
        }

        .profile-input {
          background: #f4f5fb;
          border: 1px solid transparent;
          border-radius: 8px;
          color: #0b0871;
          font: inherit;
          font-size: 15px;
          font-weight: 800;
          height: 60px;
          outline: 0;
          padding: 0 20px;
          width: 100%;
        }

        .profile-input:focus {
          border-color: #ff7a00;
          box-shadow: 0 0 0 3px rgba(255, 122, 0, .14);
        }

        .profile-input:disabled {
          color: #6f72a6;
          cursor: not-allowed;
        }

        .profile-textarea {
          height: 94px;
          padding-bottom: 18px;
          padding-top: 18px;
          resize: none;
        }

        .profile-input-shell {
          position: relative;
        }

        .profile-input-shell .profile-input {
          padding-right: 42px;
        }

        .profile-phone-shell {
          align-items: center;
          background: #f4f5fb;
          border: 1px solid transparent;
          border-radius: 8px;
          display: flex;
          height: 60px;
          overflow: hidden;
        }

        .profile-phone-prefix {
          color: #0b0871;
          flex: 0 0 auto;
          font: inherit;
          font-size: 15px;
          font-weight: 900;
          padding-left: 20px;
        }

        .profile-phone-shell .profile-input {
          background: transparent;
          border: 0;
          height: 100%;
          padding-left: 5px;
        }

        .profile-phone-shell:focus-within {
          border-color: #ff7a00;
          box-shadow: 0 0 0 3px rgba(255, 122, 0, .14);
        }

        .profile-phone-shell .profile-input:focus {
          border-color: transparent;
          box-shadow: none;
        }

        .profile-input-icon {
          color: #0b0871;
          pointer-events: none;
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
        }

        .profile-input-icon svg {
          height: 18px;
          width: 18px;
        }

        .profile-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 0;
        }

        .profile-save {
          background: #ff7a00;
          border: 0;
          border-radius: 8px;
          box-shadow: 0 14px 26px rgba(255, 122, 0, .28);
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          height: 52px;
          min-width: 170px;
          padding: 0 24px;
        }

        .profile-save:disabled {
          cursor: not-allowed;
          opacity: .62;
        }

        .profile-alert {
          border-radius: 8px;
          font-size: 13px;
          font-weight: 800;
          padding: 12px 14px;
        }

        .profile-alert.success {
          background: #edfdf3;
          color: #16794c;
        }

        .profile-alert.error {
          background: #fff1f0;
          color: #c73822;
        }

        .profile-loading {
          color: #565a91;
          font-size: 13px;
          font-weight: 800;
        }

        @media (max-width: 1040px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }

          .profile-card {
            justify-items: start;
          }

        }

        .profile-security-grid {
          align-items: start;
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .security-panel {
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 14px 28px rgba(8, 4, 120, .08);
          min-height: 250px;
          padding: 26px;
        }

        .security-panel-head {
          align-items: center;
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .security-panel-icon {
          align-items: center;
          background: #dfe1f0;
          border-radius: 7px;
          color: #0b0871;
          display: inline-flex;
          height: 38px;
          justify-content: center;
          width: 38px;
        }

        .security-panel-icon svg {
          height: 22px;
          width: 22px;
        }

        .security-panel h2 {
          color: #0b0871;
          font-size: 16px;
          font-weight: 900;
          margin: 0;
        }

        .security-form {
          display: grid;
          gap: 12px;
        }

        .security-field {
          color: #0b0871;
          display: grid;
          gap: 6px;
          font-size: 13px;
          font-weight: 900;
        }

        .security-input {
          background: #f5f6fb;
          border: 1px solid #8d91c5;
          border-radius: 7px;
          color: #0b0871;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          height: 32px;
          outline: 0;
          padding: 0 12px;
          width: 100%;
        }

        .security-input::placeholder {
          color: #8084b2;
        }

        .security-submit {
          background: #ff6b20;
          border: 0;
          border-radius: 7px;
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 900;
          height: 36px;
          margin-top: 2px;
          width: 100%;
        }

        .security-submit:disabled {
          cursor: not-allowed;
          opacity: .62;
        }

        .login-activity-list {
          display: grid;
          gap: 10px;
        }

        .login-activity-item {
          align-items: center;
          background: #d9dbe8;
          border-radius: 7px;
          display: flex;
          gap: 12px;
          min-height: 46px;
          padding: 9px 12px;
        }

        .login-activity-item.is-current {
          background: #edfdf3;
        }

        .login-activity-dot {
          background: #b7bac8;
          border-radius: 50%;
          flex: 0 0 auto;
          height: 9px;
          width: 9px;
        }

        .login-activity-item strong,
        .login-activity-item span {
          display: block;
        }

        .login-activity-item strong {
          color: #0b0871;
          font-size: 12px;
          font-weight: 900;
        }

        .login-activity-item span {
          color: #393b7f;
          font-size: 10px;
          font-weight: 700;
          margin-top: 2px;
        }

        .login-activity-remove {
          background: transparent;
          border: 1px solid #0b0871;
          border-radius: 6px;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          font-weight: 900;
          margin-left: auto;
          min-height: 28px;
          padding: 0 10px;
        }

        .security-tip {
          align-items: start;
          background: #ffe3d1;
          border: 1px solid #ff7a00;
          border-radius: 7px;
          color: #ff5f18;
          display: flex;
          gap: 10px;
          margin-top: 14px;
          padding: 11px 12px;
        }

        .security-tip svg {
          flex: 0 0 auto;
          height: 17px;
          width: 17px;
        }

        .security-tip strong,
        .security-tip span {
          display: block;
        }

        .security-tip strong {
          color: #ff5f18;
          font-size: 12px;
          font-weight: 900;
        }

        .security-tip span {
          color: #ff5f18;
          font-size: 10px;
          font-weight: 700;
          line-height: 1.35;
          margin-top: 3px;
        }

        .notifications-list {
          display: grid;
          gap: 16px;
        }

        .notifications-feed {
          background: #ffffff;
          border-radius: 12px;
          display: grid;
          gap: 14px;
          margin-top: 24px;
          padding: 20px;
        }

        .notifications-feed-head {
          align-items: center;
          display: flex;
          gap: 16px;
          justify-content: space-between;
        }

        .notifications-feed-head h2 {
          color: #0b0871;
          font-size: 18px;
          font-weight: 900;
          margin: 0;
        }

        .notifications-feed-head span {
          color: #686b9d;
          font-size: 12px;
          font-weight: 800;
        }

        .notifications-read-btn {
          background: #ff7415;
          border: 0;
          border-radius: 8px;
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          min-height: 38px;
          padding: 0 18px;
        }

        .notifications-read-btn:disabled {
          cursor: not-allowed;
          opacity: .58;
        }

        .notifications-feed-list {
          display: grid;
          gap: 10px;
        }

        .notification-feed-item {
          background: #f4f5fb;
          border: 1px solid transparent;
          border-radius: 10px;
          display: grid;
          gap: 6px;
          padding: 14px 16px;
        }

        .notification-feed-item.is-unread {
          background: #fff8ef;
          border-color: rgba(255, 116, 21, .38);
        }

        .notification-feed-item strong {
          color: #0b0871;
          font-size: 14px;
          font-weight: 900;
        }

        .notification-feed-item p {
          color: #34336d;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.45;
          margin: 0;
        }

        .notification-feed-item span {
          color: #74769d;
          font-size: 11px;
          font-weight: 800;
        }

        .notifications-state {
          border-radius: 10px;
          color: #0b0871;
          font-size: 13px;
          font-weight: 800;
          padding: 16px;
          text-align: center;
        }

        .notifications-state.is-error {
          background: #fff0ef;
          color: #d92712;
        }

        .notification-row {
          align-items: center;
          background: transparent;
          border: 1px solid #6266b4;
          border-radius: 10px;
          display: grid;
          gap: 18px;
          grid-template-columns: 54px minmax(0, 1fr) auto;
          min-height: 74px;
          padding: 14px 18px;
        }

        .notification-icon {
          align-items: center;
          background: #d3d5ea;
          border-radius: 8px;
          color: #0b0871;
          display: inline-flex;
          height: 48px;
          justify-content: center;
          width: 48px;
        }

        .notification-icon svg {
          height: 24px;
          width: 24px;
        }

        .notification-copy strong,
        .notification-copy span {
          display: block;
        }

        .notification-copy strong {
          color: #0b0871;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.2;
        }

        .notification-copy span {
          color: #0b0871;
          font-size: 12px;
          font-weight: 700;
          margin-top: 4px;
        }

        .notification-toggle {
          align-items: center;
          background: #c8d2df;
          border: 0;
          border-radius: 999px;
          cursor: pointer;
          display: inline-flex;
          height: 34px;
          justify-content: flex-start;
          padding: 4px;
          transition: background .2s;
          width: 64px;
        }

        .notification-toggle span {
          background: #ffffff;
          border-radius: 50%;
          display: block;
          height: 26px;
          transition: transform .2s;
          width: 26px;
        }

        .notification-toggle.is-on {
          background: #08a84f;
        }

        .notification-toggle.is-on span {
          transform: translateX(30px);
        }

        .profile-delete {
          background: #c73822;
          border: 0;
          border-radius: 8px;
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          min-height: 38px;
          padding: 0 18px;
        }

        .profile-delete:disabled {
          cursor: not-allowed;
          opacity: .62;
        }

        @media (max-width: 700px) {
          .profile-form-grid {
            grid-template-columns: 1fr;
          }

          .profile-security-grid {
            grid-template-columns: 1fr;
          }

          .notification-row {
            grid-template-columns: 48px minmax(0, 1fr);
          }

          .notification-toggle {
            grid-column: 1 / -1;
            justify-self: end;
          }

          .notifications-feed-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .profile-actions {
            justify-content: stretch;
          }

          .profile-save {
            width: 100%;
          }

        }
      `}</style>

      <section className="profile-page">
        <h1 className="profile-title">Profile</h1>

        <nav className="profile-tabs" aria-label="Profile settings">
          {tabs.map((tab) => (
            tab.to ? (
            <Link className="profile-tab" key={tab.label} to={tab.to}>
              <MemberIcon name={tab.icon} />
              <span>{tab.label}</span>
            </Link>
            ) : (
              <button
                className={`profile-tab ${tab.section === activeSection ? "is-active" : ""}`}
                key={tab.label}
                onClick={() => {
                  if (tab.section === "security") {
                    navigate("/member/profile?tab=security");
                    return;
                  }
                  if (tab.section === "notifications") {
                    navigate("/member/profile?tab=notifications");
                    return;
                  }
                  if (tab.section === "account") navigate("/member/profile");
                }}
                type="button"
              >
                <MemberIcon name={tab.icon} />
                <span>{tab.label}</span>
              </button>
            )
          ))}
        </nav>

        {loading && <p className="profile-loading">Memuat profile...</p>}
        {error && <div className="profile-alert error">{error}</div>}
        {message && <div className="profile-alert success">{message}</div>}

        {activeSection === "account" ? (
          <div className="profile-grid">
            <aside className="profile-card">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  {profile?.profile_image_url ? (
                    <img className="profile-avatar-image" src={profile.profile_image_url} alt="" />
                  ) : (
                    <MemberIcon name="flower" />
                  )}
                </div>
                {!isGoogleAccount && (
                  <span className="profile-camera" aria-hidden="true">
                    <CameraIcon />
                  </span>
                )}
              </div>
              {isGoogleAccount && (
                <span className="profile-google-lock">Google profile photo locked</span>
              )}

              <div>
                <div className="profile-name">{profile?.full_name || formValues.fullName || "Member"}</div>
                <div className="profile-role">{membershipText}</div>
              </div>

              <div className="profile-meta-list">
                <div className="profile-meta">
                  <MemberIcon name="profile" />
                  <div>
                    <span>Member ID</span>
                    <strong>{memberId}</strong>
                  </div>
                </div>
                <div className="profile-meta">
                  <MemberIcon name="calendar" />
                  <div>
                    <span>Join Date</span>
                    <strong>{joinDate}</strong>
                  </div>
                </div>
              </div>

              <section className="profile-danger-card">
                <button
                  className="profile-delete"
                  disabled={deleting || loading}
                  onClick={handleDeleteAccount}
                  type="button"
                >
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </section>
            </aside>

            <div className="profile-main-column">
              <section className="profile-form-card">
                <h2>Personal Information</h2>
                <div className="profile-form">
                  <div className="profile-form-grid">
                    <label className="profile-field">
                      Full Name
                      <input
                        className="profile-input"
                        value={formValues.fullName}
                        placeholder="John Doe"
                        disabled
                      />
                    </label>
                    <label className="profile-field">
                      Email Address
                      <input className="profile-input" value={formValues.email} disabled />
                    </label>
                    <label className="profile-field">
                      Phone Number
                      <span className="profile-phone-shell">
                        <span className="profile-phone-prefix">+62</span>
                        <input
                          className="profile-input"
                          value={getPhoneInputDigits(formValues.phoneNumber)}
                          placeholder="8123456789"
                          disabled
                        />
                      </span>
                    </label>
                    <label className="profile-field">
                      Date of Birth
                      <span className="profile-input-shell">
                        <input
                          className="profile-input"
                          type="date"
                          value={formValues.birthDate}
                          disabled
                        />
                        <span className="profile-input-icon" aria-hidden="true">
                          <MemberIcon name="calendar" />
                        </span>
                      </span>
                    </label>
                  </div>

                </div>
              </section>

            </div>
          </div>
        ) : activeSection === "security" ? (
          <div className="profile-security-grid">
            <section className="security-panel">
              <div className="security-panel-head">
                <span className="security-panel-icon" aria-hidden="true">
                  <LockIcon />
                </span>
                <h2>Change Password</h2>
              </div>

              <form className="security-form" onSubmit={handlePasswordSubmit}>
                <label className="security-field">
                  Current Password
                  <input
                    className="security-input"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => updatePasswordField("currentPassword", event.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    required
                  />
                </label>
                <label className="security-field">
                  New Password
                  <input
                    className="security-input"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => updatePasswordField("newPassword", event.target.value)}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    required
                  />
                </label>
                <label className="security-field">
                  Confirm New Password
                  <input
                    className="security-input"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => updatePasswordField("confirmPassword", event.target.value)}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    required
                  />
                </label>
                <button className="security-submit" disabled={saving || loading} type="submit">
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </form>
            </section>

            <section className="security-panel">
              <div className="security-panel-head">
                <span className="security-panel-icon" aria-hidden="true">
                  <PulseIcon />
                </span>
                <h2>Login Activity</h2>
              </div>

              <div className="login-activity-list">
                {sessionsError && <div className="notifications-state is-error">{sessionsError}</div>}
                {sessionsLoading && <div className="notifications-state">Loading sessions...</div>}
                {!sessionsLoading && !sessionsError && sessions.length === 0 && (
                  <div className="notifications-state">No active sessions.</div>
                )}
                {!sessionsLoading && !sessionsError && sessions.map((session) => (
                  <article className={`login-activity-item ${session.is_current ? "is-current" : ""}`} key={session.id}>
                    <span className="login-activity-dot" aria-hidden="true" />
                    <div>
                      <strong>{getSessionDeviceLabel(session)}{session.is_current ? " (Current)" : ""}</strong>
                      <span>
                        {[session.city, session.country].filter(Boolean).join(", ") || session.ip_address || "Unknown location"}
                        {" · "}
                        {formatSessionTime(session.last_active_at || session.created_at)}
                      </span>
                    </div>
                    {!session.is_current && (
                      <button className="login-activity-remove" onClick={() => revokeSession(session.id)} type="button">
                        Revoke
                      </button>
                    )}
                  </article>
                ))}
              </div>

              <div className="security-tip">
                <AlertIcon />
                <div>
                  <strong>Security Tip</strong>
                  <span>If you notice any suspicious activity, change your password immediately and contact support.</span>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <>
            <section className="notifications-list" aria-label="Notification preferences">
              {notificationPreferences.map((item) => (
                <article className="notification-row" key={item.key}>
                  <span className="notification-icon" aria-hidden="true">
                    <BellIcon />
                  </span>
                  <div className="notification-copy">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                  <button
                    aria-label={`${notificationSettings[item.key] ? "Disable" : "Enable"} ${item.title}`}
                    className={`notification-toggle ${notificationSettings[item.key] ? "is-on" : ""}`}
                    onClick={() => toggleNotification(item.key)}
                    type="button"
                  >
                    <span />
                  </button>
                </article>
              ))}
            </section>

            <section className="notifications-feed" aria-label="Recent notifications">
              <div className="notifications-feed-head">
                <div>
                  <h2>Recent Notifications</h2>
                  <span>{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</span>
                </div>
                <button
                  className="notifications-read-btn"
                  disabled={notificationsLoading || unreadCount <= 0}
                  onClick={markNotificationsAsRead}
                  type="button"
                >
                  Mark All As Read
                </button>
              </div>

              {notificationsError ? (
                <div className="notifications-state is-error">{notificationsError}</div>
              ) : notificationsLoading ? (
                <div className="notifications-state">Loading notifications...</div>
              ) : visibleNotifications.length === 0 ? (
                <div className="notifications-state">No notifications to show.</div>
              ) : (
                <div className="notifications-feed-list">
                  {visibleNotifications.map((item) => (
                    <article
                      className={`notification-feed-item ${item.is_read ? "" : "is-unread"}`}
                      key={item.id || item.notification_id}
                    >
                      <strong>{item.title}</strong>
                      <p>{item.message}</p>
                      <span>{formatNotificationTime(item.created_at)}</span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </MemberLayout>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 6l1.5-2h3L15 6h3a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12h3l2-7 4 14 2-7h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
