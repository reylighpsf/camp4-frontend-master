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
        .member-dashboard-menu { display: grid; gap: 10px; padding: 34px 18px; }
        .member-dashboard-menu a { align-items: center; border-radius: 999px; color: #d8d8ff; display: flex; gap: 18px; font-size: 15px; font-weight: 700; min-height: 54px; padding: 0 26px; text-decoration: none; white-space: nowrap; }
        .member-dashboard-menu a.is-active { background: #ff7a00; box-shadow: 0 12px 22px rgba(255,122,0,.32); color: #fff; }
        .member-main { min-width: 0; overflow: hidden; }
        .member-topbar { align-items: center; background: #f4f5f9; display: flex; height: 112px; justify-content: space-between; padding: 0 40px; }
        .member-greeting h1 { color: #0b0871; font-family: 'Anton', sans-serif; font-size: 31px; font-weight: 400; letter-spacing: 0; line-height: 1; }
        .member-greeting p { color: #0b0871; font-size: 13px; font-weight: 700; margin-top: 10px; opacity: .8; }
        .topbar-actions { align-items: center; display: flex; gap: 18px; }
        .round-action { align-items: center; background: #c9cbe1; border: 0; border-radius: 50%; color: #111; cursor: pointer; display: inline-flex; height: 56px; justify-content: center; width: 56px; }
        .avatar-action { background: linear-gradient(135deg, #7d76cf, #ff7a00); color: #fff; }
        .member-content { max-width: 1280px; padding: 30px 40px 42px; }
        .page-title { color: #0b0871; font-family: 'Anton', sans-serif; font-size: 34px; font-weight: 400; letter-spacing: 0; margin-bottom: 18px; }
        @media (max-width: 1120px) { .member-page { grid-template-columns: 88px minmax(0,1fr); } .member-dashboard-brand { justify-content: center; padding: 16px; } .member-dashboard-brand strong, .member-dashboard-menu span { display: none; } .member-dashboard-menu a { justify-content: center; padding: 0; } }
        @media (max-width: 760px) { .member-page { display: block; } .member-dashboard-sidebar { min-height: auto; border-right: 0; } .member-dashboard-brand { height: auto; justify-content: flex-start; } .member-dashboard-brand strong, .member-dashboard-menu span { display: inline; } .member-dashboard-menu { display: flex; overflow-x: auto; padding: 14px; } .member-dashboard-menu a { flex: 0 0 auto; padding: 0 18px; } .member-topbar { align-items: flex-start; flex-direction: column; height: auto; padding: 24px; } .topbar-actions { margin-top: 18px; } .member-content { max-width: none; padding: 24px; } }
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
      </aside>
      <section className="member-main">
        <header className="member-topbar">
          <div className="member-greeting">
            <h1>Hi, {displayName}!</h1>
            <p>Monday, 25 May 2026</p>
          </div>
          <div className="topbar-actions">
            <button className="round-action" type="button" aria-label="Notifications"><MemberIcon name="bell" /></button>
            <button className="round-action avatar-action" type="button" onClick={handleLogout} aria-label="Logout"><MemberIcon name="flower" /></button>
          </div>
        </header>
        <div className="member-content">{children}</div>
      </section>
    </main>
  );
}
