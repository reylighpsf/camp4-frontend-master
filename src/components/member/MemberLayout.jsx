import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../auth/useAuth";
import vocafitLogo from "../../assets/auth/vocafit-logo.png";
import MemberIcon from "./MemberIcon";
import memberMenuItems from "./memberMenuItems";

export default function MemberLayout({ active = "Dashboard", children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName =
    user?.full_name || user?.name || user?.email?.split("@")[0] || "Member";
  const profileImageUrl = user?.profile_image_url || user?.profileImageUrl || "";

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  return (
    <main className="member-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .member-page { min-height: 100vh; background: #cfd1e3; color: #0b0871; display: grid; grid-template-columns: 288px minmax(0, 1fr); font-family: 'DM Sans', sans-serif; }
        .member-dashboard-sidebar { background: #0b0871; border-right: 4px solid #ff7a00; color: #fff; min-height: 100vh; }
        .member-dashboard-brand { align-items: center; border-bottom: 1px solid rgba(255,255,255,.18); display: flex; gap: 14px; height: 112px; padding: 18px 30px; text-decoration: none; }
        .member-dashboard-brand img { height: 66px; object-fit: contain; width: 66px; }
        .member-dashboard-brand strong { color: #ff7a00; font-size: 40px; font-weight: 900; line-height: 1; }
        .member-dashboard-sidebar { display: flex; flex-direction: column; }
        .member-dashboard-menu { display: grid; gap: 10px; padding: 34px 18px; }
        .member-dashboard-menu a,
        .member-dashboard-logout { align-items: center; border-radius: 999px; color: #d8d8ff; display: flex; gap: 18px; font-size: 15px; font-weight: 700; min-height: 54px; padding: 0 26px; text-decoration: none; white-space: nowrap; }
        .member-dashboard-menu a.is-active { background: #ff7a00; box-shadow: 0 12px 22px rgba(255,122,0,.32); color: #fff; }
        .member-dashboard-footer { border-top: 1px solid rgba(255,255,255,.18); display: grid; gap: 10px; margin-top: auto; padding: 18px; }
        .member-dashboard-logout { background: transparent; border: 0; cursor: pointer; font: inherit; text-align: left; }
        .member-dashboard-logout:hover { background: rgba(255,255,255,.1); color: #fff; }
        .member-main { min-width: 0; overflow: hidden; }
        .member-topbar { align-items: center; background: #f4f5f9; display: flex; gap: 24px; height: 112px; justify-content: space-between; padding: 0 40px; }
        .member-greeting h1 { color: #0b0871; font-family: 'Anton', sans-serif; font-size: 31px; font-weight: 400; letter-spacing: 0; line-height: 1; }
        .member-greeting p { color: #0b0871; font-size: 13px; font-weight: 700; margin-top: 10px; opacity: .8; }
        .member-header-actions { align-items: center; display: flex; flex: 0 0 auto; gap: 28px; }
        .member-notification { align-items: center; background: #d4d2ec; border: 0; border-radius: 50%; color: #050505; cursor: pointer; display: inline-flex; height: 64px; justify-content: center; width: 64px; }
        .member-notification svg { height: 31px; width: 31px; }
        .member-avatar { align-items: center; background: #0b0871; border: 3px solid #ff7a00; border-radius: 50%; color: #fff; display: inline-flex; flex: 0 0 auto; font-size: 20px; font-weight: 900; height: 74px; justify-content: center; overflow: hidden; width: 74px; }
        .member-avatar img { height: 100%; object-fit: cover; width: 100%; }
        .member-content { max-width: 1280px; padding: 30px 40px 42px; }
        .page-title { color: #0b0871; font-family: 'Anton', sans-serif; font-size: 34px; font-weight: 400; letter-spacing: 0; margin-bottom: 18px; }
        @media (max-width: 1120px) { .member-page { grid-template-columns: 88px minmax(0,1fr); } .member-dashboard-brand { justify-content: center; padding: 16px; } .member-dashboard-brand strong, .member-dashboard-menu span, .member-dashboard-logout span { display: none; } .member-dashboard-menu a, .member-dashboard-logout { justify-content: center; padding: 0; } }
        @media (max-width: 760px) { .member-page { display: block; } .member-dashboard-sidebar { min-height: auto; border-right: 0; } .member-dashboard-brand { height: auto; justify-content: flex-start; } .member-dashboard-brand strong, .member-dashboard-menu span, .member-dashboard-logout span { display: inline; } .member-dashboard-menu { display: flex; overflow-x: auto; padding: 14px; } .member-dashboard-menu a { flex: 0 0 auto; padding: 0 18px; } .member-dashboard-footer { display: none; } .member-topbar { height: auto; padding: 24px; } .member-header-actions { gap: 14px; } .member-notification { height: 48px; width: 48px; } .member-avatar { height: 56px; width: 56px; } .member-content { max-width: none; padding: 24px; } }
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
            <button className="member-notification" type="button" aria-label="Notifications">
              <BellIcon />
            </button>
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
