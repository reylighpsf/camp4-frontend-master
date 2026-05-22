import { Navigate } from "react-router";
import { useAuth } from "./authContext";

const PrivateAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/sign-in" replace />;
  return children;
};

function LoadingScreen() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');
        .loading-screen {
          min-height: 100vh;
          background: #0a0a14;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-family: 'DM Sans', sans-serif;
          margin: 0;
        }
        .loading-screen::before {
          content: '';
          position: fixed;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
          top: -100px; right: -100px;
          pointer-events: none;
        }
        .loading-screen::after {
          content: '';
          position: fixed;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%);
          bottom: -50px; left: -50px;
          pointer-events: none;
        }
        .loading-ring {
          width: 36px; height: 36px;
          border: 2.5px solid rgba(99,102,241,0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text {
          font-size: 13px;
          color: #4b5563;
          letter-spacing: 0.3px;
        }
      `}</style>
      <div className="loading-screen">
        <div className="loading-ring" />
        <p className="loading-text">Memuat...</p>
      </div>
    </>
  );
}

export default PrivateAuth;
