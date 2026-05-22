import { TodoProvider } from "../../features/todos/todoContext";
import TodoForm from "../../features/todos/TodoForm";
import TodoList from "../../features/todos/TodoList";
import { useNavigate } from "react-router";
import { useAuth } from "../../features/auth/authContext";

export default function TodosPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      navigate("/signin");
    }
  };

  return (
    <TodoProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .todos-page {
          min-height: 100vh;
          background: #0a0a14;
          font-family: 'DM Sans', sans-serif;
          padding: 40px 24px;
          position: relative;
          overflow: hidden;
        }
        .todos-page::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
          top: -100px; right: -100px;
          pointer-events: none;
        }
        .todos-page::after {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%);
          bottom: -50px; left: -50px;
          pointer-events: none;
        }
        .todos-card {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          background: rgba(15,15,28,0.95);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .todos-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .todos-logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .todos-logo {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(99,102,241,0.4);
          flex-shrink: 0;
        }
        .todos-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 500;
          color: #f1f0ff;
          letter-spacing: -0.3px;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 9px;
          color: #fca5a5;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .logout-btn:hover {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.35);
        }
        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin-bottom: 28px;
        }
      `}</style>

      <div className="todos-page">
        <div className="todos-card">
          <div className="todos-header">
            <div className="todos-logo-wrap">
              <div className="todos-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 11l3 3L22 4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="todos-title">My Tasks</span>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="16 17 21 12 16 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Keluar
            </button>
          </div>

          <div className="divider" />
          <TodoForm />
          <TodoList />
        </div>
      </div>
    </TodoProvider>
  );
}
