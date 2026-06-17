import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../../../hooks/useAuth.js";
import api from "../../../services/authApi.js";
import vocafitLogo from "../../../assets/auth/vocafit-logo.png";
import MemberIcon from "./MemberIcon";
import memberMenuItems from "./hooks/memberMenuItems";
import "../../../styles/member/layout/base.css";
import "../../../styles/member/layout/responsive.css";

const formatNotificationTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
};

const formatHeaderDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jakarta",
    weekday: "long",
    year: "numeric",
  }).format(value);

export default function MemberLayout({ active = "Dashboard", children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const displayName =
    user?.full_name || user?.name || user?.email?.split("@")[0] || "Member";
  const profileImageUrl =
    user?.profile_image_thumb ||
    user?.profileImageThumb ||
    user?.profile_image_url ||
    user?.profileImageUrl ||
    "";

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get("/notifications/unread-count");
        setUnreadCount(response.data?.data?.unread_count || 0);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    let isMounted = true;

    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError("");

      try {
        const [listResponse, countResponse] = await Promise.all([
          api.get("/notifications", { params: { page: 1, limit: 5 } }),
          api.get("/notifications/unread-count"),
        ]);

        if (!isMounted) return;
        setNotifications(listResponse.data?.data || []);
        setUnreadCount(countResponse.data?.data?.unread_count || 0);
      } catch (err) {
        if (!isMounted) return;
        setNotificationsError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Gagal memuat notifikasi.",
        );
      } finally {
        if (isMounted) setNotificationsLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [notificationsOpen]);

  useEffect(() => {
    if (!notificationsOpen || unreadCount <= 0) return undefined;

    let isMounted = true;

    const markNotificationsAsRead = async () => {
      setUnreadCount(0);
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));

      try {
        await api.patch("/notifications/read");
      } catch {
        if (!isMounted) return;
      }
    };

    markNotificationsAsRead();

    return () => {
      isMounted = false;
    };
  }, [notificationsOpen, unreadCount]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  const openNotificationsPage = () => {
    setNotificationsOpen(false);
    navigate("/member/profile?tab=notifications");
  };

  return (
    <main className="member-page">

      <aside className="member-dashboard-sidebar">
        <Link className="member-dashboard-brand" to="/member">
          <img src={vocafitLogo} alt="Vocafit" />
          <strong>Vocafit</strong>
        </Link>
        <nav className="member-dashboard-menu" aria-label="Member navigation">
          {memberMenuItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive || item.label === active ? "is-active" : ""
              }
              end={item.to === "/member"}
              key={item.label}
              to={item.to}
            >
              <MemberIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="member-dashboard-footer">
          <button className="member-dashboard-logout" type="button" onClick={handleLogout}>
            <MemberIcon name="login" />
            <span>LogOut</span>
          </button>
        </div>
      </aside>
      <section className="member-main">
        <header className="member-topbar">
          <div className="member-greeting">
            <h1>Hi, {displayName}!</h1>
            <p>{formatHeaderDate(currentDate)}</p>
          </div>
          <div className="member-header-actions">
            <div className="member-notification-wrap" ref={notificationRef}>
              <button
                aria-expanded={notificationsOpen}
                className={`member-notification ${notificationsOpen ? "is-open" : ""}`}
                onClick={() => setNotificationsOpen((value) => !value)}
                type="button"
                aria-label="Notifications"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="member-notification-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="member-notification-dropdown" role="dialog" aria-label="Notifications">
                  <div className="member-notification-head">
                    <strong>Notifications</strong>
                    <span>{unreadCount} unread</span>
                  </div>
                  <div className="member-notification-list">
                    {notificationsError ? (
                      <div className="member-notification-state is-error">{notificationsError}</div>
                    ) : notificationsLoading ? (
                      <div className="member-notification-state">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="member-notification-state">No notifications yet.</div>
                    ) : (
                      notifications.map((item) => (
                        <article
                          className={`member-notification-item ${item.is_read ? "" : "is-unread"}`}
                          key={item.id || item.notification_id}
                        >
                          <strong>{item.title}</strong>
                          <p>{item.message}</p>
                          <span>{formatNotificationTime(item.created_at)}</span>
                        </article>
                      ))
                    )}
                  </div>
                  <button className="member-notification-footer" type="button" onClick={openNotificationsPage}>
                    View all notifications
                  </button>
                </div>
              )}
            </div>
            <span className="member-avatar" aria-label={displayName}>
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="" />
              ) : (
                displayName.trim().charAt(0).toUpperCase()
              )}
            </span>
          </div>
        </header>
        <div className="member-content">{children}</div>
      </section>
    </main>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

