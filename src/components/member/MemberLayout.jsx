import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../auth/hooks/useAuth";
import api from "../auth/hooks/authApi";
import vocafitLogo from "../../assets/auth/vocafit-logo.png";
import MemberIcon from "./MemberIcon";
import memberMenuItems from "./hooks/memberMenuItems";

const formatNotificationTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
};

export default function MemberLayout({ active = "Dashboard", children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notificationRef = useRef(null);
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        .member-page {
          min-height: 100vh;
          background: #cfd1e3;
          color: #0b0871;
          display: grid;
          grid-template-columns: 288px minmax(0, 1fr);
          font-family: 'DM Sans', sans-serif;
        }
        .member-dashboard-sidebar {
          background: #0b0871;
          border-right: 4px solid #ff7a00;
          color: #fff;
          min-height: 100vh;
        }
        .member-dashboard-brand {
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,.18);
          display: flex;
          gap: 14px;
          height: 112px;
          padding: 18px 30px;
          text-decoration: none;
        }
        .member-dashboard-brand img {
          height: 66px;
          object-fit: contain;
          width: 66px;
        }
        .member-dashboard-brand strong {
          color: #ff7a00;
          font-size: 40px;
          font-weight: 900;
          line-height: 1;
        }
        .member-dashboard-sidebar {
          display: flex;
          flex-direction: column;
        }
        .member-dashboard-menu {
          display: grid;
          gap: 10px;
          padding: 34px 18px;
        }
        .member-dashboard-menu a,
        .member-dashboard-logout {
          align-items: center;
          border-radius: 999px;
          color: #d8d8ff;
          display: flex;
          gap: 18px;
          font-size: 15px;
          font-weight: 700;
          min-height: 54px;
          padding: 0 26px;
          text-decoration: none;
          white-space: nowrap;
        }
        .member-dashboard-menu a.is-active {
          background: #ff7a00;
          box-shadow: 0 12px 22px rgba(255,122,0,.32);
          color: #fff;
        }
        .member-dashboard-footer {
          border-top: 1px solid rgba(255,255,255,.18);
          display: grid;
          gap: 10px;
          margin-top: auto;
          padding: 18px;
        }
        .member-dashboard-logout {
          background: transparent;
          border: 0;
          cursor: pointer;
          font: inherit;
          text-align: left;
        }
        .member-dashboard-logout:hover {
          background: rgba(255,255,255,.1);
          color: #fff;
        }
        .member-main {
          min-width: 0;
          overflow: hidden;
        }
        .member-topbar {
          align-items: center;
          background: #f4f5f9;
          display: flex;
          gap: 24px;
          height: 112px;
          justify-content: space-between;
          padding: 0 40px;
        }
        .member-greeting h1 {
          color: #0b0871;
          font-family: 'Anton', sans-serif;
          font-size: 31px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
        }
        .member-greeting p {
          color: #0b0871;
          font-size: 13px;
          font-weight: 700;
          margin-top: 10px;
          opacity: .8;
        }
        .member-header-actions {
          align-items: center;
          display: flex;
          flex: 0 0 auto;
          gap: 28px;
        }
        .member-notification-wrap { position: relative; }
        .member-notification {
          align-items: center;
          background: #d4d2ec;
          border: 0;
          border-radius: 50%;
          color: #050505;
          cursor: pointer;
          display: inline-flex;
          height: 64px;
          justify-content: center;
          position: relative;
          width: 64px;
        }
        .member-notification:hover, .member-notification.is-open { background: #c6c3e7; }
        .member-notification svg {
          height: 31px;
          width: 31px;
        }
        .member-notification-badge {
          align-items: center;
          background: #ff6b20;
          border: 2px solid #f4f5f9;
          border-radius: 999px;
          color: #fff;
          display: inline-flex;
          font-size: 10px;
          font-weight: 900;
          height: 22px;
          justify-content: center;
          min-width: 22px;
          padding: 0 5px;
          position: absolute;
          right: -2px;
          top: -2px;
        }
        .member-notification-dropdown {
          background: #fff;
          border: 1px solid #d9dcef;
          border-radius: 8px;
          box-shadow: 0 18px 36px rgba(11,8,113,.18);
          color: #0b0871;
          overflow: hidden;
          position: absolute;
          right: 0;
          top: calc(100% + 12px);
          width: min(360px, calc(100vw - 32px));
          z-index: 30;
        }
        .member-notification-head {
          align-items: center;
          border-bottom: 1px solid #eef0f7;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
        }
        .member-notification-head strong {
          font-size: 14px;
          font-weight: 900;
        }
        .member-notification-head span {
          color: #ff6b20;
          font-size: 11px;
          font-weight: 900;
        }
        .member-notification-list {
          display: grid;
          max-height: 320px;
          overflow-y: auto;
        }
        .member-notification-item {
          border-bottom: 1px solid #eef0f7;
          display: grid;
          gap: 5px;
          padding: 13px 16px;
          text-align: left;
        }
        .member-notification-item.is-unread { background: #fff8f3; }
        .member-notification-item strong {
          color: #0b0871;
          font-size: 13px;
          font-weight: 900;
          line-height: 1.25;
        }
        .member-notification-item p {
          color: #384076;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.35;
          margin: 0;
        }
        .member-notification-item span {
          color: #7a80a3;
          font-size: 11px;
          font-weight: 800;
        }
        .member-notification-state {
          color: #7a80a3;
          font-size: 12px;
          font-weight: 800;
          padding: 18px 16px;
          text-align: center;
        }
        .member-notification-state.is-error { color: #c73822; }
        .member-notification-footer {
          background: #f8f9fd;
          border: 0;
          color: #ff6b20;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          min-height: 42px;
          width: 100%;
        }
        .member-notification-footer:hover { background: #fff0e9; }
        .member-avatar {
          align-items: center;
          background: #0b0871;
          border: 3px solid #ff7a00;
          border-radius: 50%;
          color: #fff;
          display: inline-flex;
          flex: 0 0 auto;
          font-size: 20px;
          font-weight: 900;
          height: 74px;
          justify-content: center;
          overflow: hidden;
          width: 74px;
        }
        .member-avatar img {
          height: 100%;
          object-fit: cover;
          width: 100%;
        }
        .member-content {
          max-width: 1280px;
          padding: 30px 40px 42px;
        }
        .page-title {
          color: #0b0871;
          font-family: 'Anton', sans-serif;
          font-size: 34px;
          font-weight: 400;
          letter-spacing: 0;
          margin-bottom: 18px;
        }
        @media (max-width: 1120px) {
          .member-page {
            grid-template-columns: 88px minmax(0, 1fr);
          }

          .member-dashboard-brand {
            justify-content: center;
            padding: 16px;
          }

          .member-dashboard-brand strong,
          .member-dashboard-menu span,
          .member-dashboard-logout span {
            display: none;
          }

          .member-dashboard-menu a,
          .member-dashboard-logout {
            justify-content: center;
            padding: 0;
          }
        }

        @media (max-width: 760px) {
          .member-page {
            display: block;
          }

          .member-dashboard-sidebar {
            border-right: 0;
            min-height: auto;
          }

          .member-dashboard-brand {
            height: auto;
            justify-content: flex-start;
          }

          .member-dashboard-brand strong,
          .member-dashboard-menu span,
          .member-dashboard-logout span {
            display: inline;
          }

          .member-dashboard-menu {
            display: flex;
            overflow-x: auto;
            padding: 14px;
          }

          .member-dashboard-menu a {
            flex: 0 0 auto;
            padding: 0 18px;
          }

          .member-dashboard-footer {
            display: none;
          }

          .member-topbar {
            height: auto;
            padding: 24px;
          }

          .member-header-actions {
            gap: 14px;
          }

          .member-notification {
            height: 48px;
            width: 48px;
          }

          .member-notification-dropdown {
            right: -70px;
            top: calc(100% + 10px);
          }

          .member-avatar {
            height: 56px;
            width: 56px;
          }

          .member-content {
            max-width: none;
            padding: 24px;
          }
        }
      `}</style>
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
            <p>Monday, 25 May 2026</p>
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
