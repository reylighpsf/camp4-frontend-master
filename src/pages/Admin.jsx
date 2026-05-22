import { Link, useNavigate } from "react-router";
import { useAuth } from "../features/auth/authContext";

export default function AdminPage() {
  const { signout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signout();
    navigate("/sign-in");
  };

  return (
    <>
      <style>{`
        .page {
          min-height: 100vh;
          background: #0a0a14;
          padding: 24px;
          font-family: 'DM Sans', sans-serif;
          color: #e5e7eb;
        }

        .card {
          max-width: 640px;
          margin: auto;
          background: rgba(15,15,28,0.95);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .title {
          font-size: 20px;
          font-weight: 600;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #e5e7eb;
        }

        .btn:hover {
          background: rgba(99,102,241,0.2);
        }

        .btn-logout {
          background: rgba(239,68,68,0.15);
          color: #fca5a5;
          border-color: rgba(239,68,68,0.4);
        }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="header">
            <h1 className="title">Admin Page</h1>

            <div className="actions">
              <Link to="/" className="btn">
                Home
              </Link>
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-400">
            Hanya role admin yang bisa lihat ini
          </p>
        </div>
      </div>
    </>
  );
}
