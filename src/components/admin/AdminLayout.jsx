import { useNavigate } from "react-router";
import { useAuth } from "../auth/hooks/useAuth";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ title, subtitle, children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  return (
    <main className="admin-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        html,
        body,
        #root {
          margin: 0;
          min-height: 100%;
          width: 100%;
        }

        .admin-page {
          background: #f4f5f8;
          color: #05050c;
          display: grid;
          font-family: 'DM Sans', sans-serif;
          grid-template-columns: 292px minmax(0, 1fr);
          min-height: 100vh;
          width: 100%;
        }

        .admin-main {
          min-width: 0;
          padding: 28px;
        }

        .admin-topbar {
          align-items: flex-start;
          display: flex;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .admin-topbar h1 {
          font-size: 30px;
          font-weight: 800;
          line-height: 1;
          margin: 0 0 12px;
        }

        .admin-topbar p {
          color: #4b5563;
          font-size: 14px;
          margin: 0;
        }

        .admin-content-panel {
          background: #fff;
          border-radius: 14px;
          min-height: 420px;
          padding: 24px;
        }

        @media (max-width: 1040px) {
          .admin-page {
            grid-template-columns: 92px minmax(0, 1fr);
          }
        }

        @media (max-width: 680px) {
          .admin-page {
            display: block;
          }

          .admin-main {
            padding: 20px 14px;
          }
        }
      `}</style>

      <AdminSidebar onLogout={handleLogout} />
      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </header>
        <section className="admin-content-panel">{children}</section>
      </section>
    </main>
  );
}
