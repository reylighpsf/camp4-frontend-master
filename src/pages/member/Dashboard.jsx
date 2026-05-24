import { Link, useNavigate } from "react-router";
import { useAuth } from "../../components/auth/useAuth";
import vocafitLogo from "../../assets/auth/vocafit-logo.png";

export default function MemberDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/");
    }
  };

  return (
    <main className="member-dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .member-dashboard {
          min-height: 100vh;
          min-height: 100dvh;
          background: #f1f2f5;
          color: #0a1185;
          font-family: 'DM Sans', sans-serif;
          padding: 28px clamp(18px, 5vw, 72px);
        }

        .member-nav {
          align-items: center;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 42px;
        }

        .member-brand {
          align-items: center;
          color: #ff7a00;
          display: inline-flex;
          font-size: 22px;
          font-weight: 900;
          gap: 12px;
          text-decoration: none;
        }

        .member-brand img {
          height: 44px;
          object-fit: contain;
          width: 44px;
        }

        .member-actions {
          align-items: center;
          display: flex;
          gap: 12px;
        }

        .member-actions a,
        .member-actions button {
          border: 0;
          border-radius: 999px;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          min-height: 40px;
          padding: 0 18px;
          text-decoration: none;
        }

        .member-actions a {
          align-items: center;
          background: #0a1185;
          color: #fff;
          display: inline-flex;
        }

        .member-actions button {
          background: #ff7a00;
          color: #fff;
        }

        .member-hero {
          background: #0a1185;
          border-radius: 18px;
          color: #fff;
          display: grid;
          gap: 28px;
          grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.6fr);
          margin-bottom: 24px;
          overflow: hidden;
          padding: clamp(28px, 5vw, 56px);
        }

        .member-hero p {
          color: #ffe08d;
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .member-hero h1 {
          color: #fff;
          font-size: clamp(34px, 5vw, 64px);
          font-weight: 900;
          line-height: 1;
          max-width: 780px;
        }

        .member-summary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 14px;
          padding: 22px;
        }

        .member-summary span {
          color: #ffe08d;
          display: block;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .member-summary strong {
          color: #fff;
          display: block;
          font-size: 24px;
          margin-bottom: 4px;
        }

        .dashboard-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .dashboard-card {
          background: #fff;
          border: 1px solid #dce0ee;
          border-radius: 14px;
          min-height: 160px;
          padding: 22px;
          box-shadow: 0 14px 34px rgba(10, 17, 133, 0.08);
        }

        .dashboard-card span {
          background: #ffe08d;
          border-radius: 999px;
          color: #0a1185;
          display: inline-flex;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 18px;
          padding: 7px 12px;
          text-transform: uppercase;
        }

        .dashboard-card h2 {
          color: #0a1185;
          font-size: 22px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .dashboard-card p {
          color: #586074;
          font-size: 14px;
          line-height: 1.6;
        }

        @media (max-width: 820px) {
          .member-hero,
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .member-nav,
          .member-actions {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <nav className="member-nav" aria-label="Navigasi member">
        <Link className="member-brand" to="/">
          <img src={vocafitLogo} alt="Vocafit" />
          <span>Vocafit</span>
        </Link>
        <div className="member-actions">
          <Link to="/">Landing Page</Link>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <section className="member-hero">
        <div>
          <p>Member Dashboard</p>
          <h1>Welcome back, {user?.full_name || user?.email || "Member"}.</h1>
        </div>
        <aside className="member-summary">
          <span>Account Role</span>
          <strong>{user?.role || "member"}</strong>
          <small>{user?.email}</small>
        </aside>
      </section>

      <section className="dashboard-grid" aria-label="Ringkasan member">
        <article className="dashboard-card">
          <span>Membership</span>
          <h2>Active Plan</h2>
          <p>Lihat status membership, harga bulanan, dan informasi akun kamu.</p>
        </article>
        <article className="dashboard-card">
          <span>Visits</span>
          <h2>Gym Access</h2>
          <p>Pantau kunjungan gym dan akses latihan harian dari satu dashboard.</p>
        </article>
        <article className="dashboard-card">
          <span>Schedule</span>
          <h2>Trainer Sessions</h2>
          <p>Cek jadwal trainer dan program latihan yang tersedia di Vocafit.</p>
        </article>
      </section>
    </main>
  );
}
