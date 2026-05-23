import { Navigate } from "react-router";
import { useAuth } from "./authContext";

const AllowRole = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/sign-in" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;
  return children;
};

function LoadingScreen() {
  return (
    <>
      <style>{`
        .loading-screen {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100vw;
          background: #0b0871;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          font-family: 'DM Sans', sans-serif;
          position: fixed;
          inset: 0;
          z-index: 9999;
          margin: 0;
          overflow: hidden;
        }
        .loading-screen::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(255,224,141,0.14) 0%, transparent 70%);
          top: -100px; right: -100px;
          pointer-events: none;
        }
        .loading-screen::after {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,122,0,0.12) 0%, transparent 70%);
          bottom: -50px; left: -50px;
          pointer-events: none;
        }
        .loading-ring {
          width: 36px; height: 36px;
          border: 2.5px solid rgba(255,224,141,0.28);
          border-top-color: #ffe08d;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text {
          font-size: 13px;
          color: #ffe08d;
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

export default AllowRole;
