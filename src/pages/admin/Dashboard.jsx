import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/components/auth/hooks/useAuth";
import gymImage from "../../assets/auth/signup-gym.jpg";
import AdminSidebar, { Icon } from "@/components/admin/AdminSidebar";
import useAdminDashboard from "./hooks/useAdminDashboard";
import getSocket from "@/components/socket/socketClient";

const getScanNotification = (payload) => {
  const data = payload?.data || payload || {};
  const name = data.user?.full_name || data.user?.name || data.full_name || data.name || data.userName || "Member";
  const action = data.action || data.type || data.status || "SCAN";
  const message = data.message || `${name} ${action === "TAP_OUT" ? "tap out" : "tap in"} berhasil.`;

  return {
    id: `${Date.now()}-${Math.random()}`,
    message,
    meta: data.timestamp || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
  };
};

export default function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const {
    statCards,
    trainers,
    payments,
    activities,
    transactionsChart,
    loading,
    error,
  } = useAdminDashboard();
  const [scanNotifications, setScanNotifications] = useState([]);
  const chart = useMemo(() => {
    const points = (transactionsChart || []).slice(-6);
    if (points.length === 0) {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
        path: "M82 138 L180 126 L278 112 L376 138 L474 98 L572 76",
        circles: [[82, 138], [180, 126], [278, 112], [376, 138], [474, 98], [572, 76]],
      };
    }

    const maxValue = Math.max(...points.map((point) => point.totalAmount), 1);
    const step = points.length > 1 ? 490 / (points.length - 1) : 0;
    const circles = points.map((point, index) => {
      const x = points.length === 1 ? 327 : 82 + index * step;
      const y = 174 - (point.totalAmount / maxValue) * 156;
      return [x, y];
    });

    return {
      labels: points.map((point) => {
        const date = new Date(point.date);
        return Number.isNaN(date.getTime())
          ? ""
          : date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      }),
      path: circles.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" "),
      circles,
    };
  }, [transactionsChart]);

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  useEffect(() => {
    const socket = getSocket();
    const scanEvents = ["visit:scan", "visit:scanned", "visit:updated", "scan:success"];

    const handleScanEvent = (payload) => {
      const notification = getScanNotification(payload);
      setScanNotifications((current) => [notification, ...current].slice(0, 3));
    };

    scanEvents.forEach((eventName) => socket.on(eventName, handleScanEvent));
    socket.connect();

    return () => {
      scanEvents.forEach((eventName) => socket.off(eventName, handleScanEvent));
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
          margin: 0;
          overflow-x: hidden;
        }

        .admin-page {
          min-height: 100vh;
          width: 100%;
          display: grid;
          grid-template-columns: 292px minmax(0, 1fr);
          background: #f4f5f8;
          color: #05050c;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        .main {
          min-width: 0;
          width: 100%;
          padding: 28px 18px;
          overflow-x: hidden;
        }

        .topbar {
          min-height: 88px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 0 24px;
        }

        .topbar h1 {
          margin: 0 0 16px;
          font-size: 30px;
          line-height: 1;
          font-weight: 800;
        }

        .topbar p {
          margin: 0;
          font-size: 14px;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 18px;
          padding-top: 12px;
        }

        .avatar {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background: #ffd369;
          color: #130b5d;
          display: grid;
          place-items: center;
          font-size: 11px;
          font-weight: 800;
        }

        .profile-name {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
        }

        .content {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 2.25fr) minmax(300px, 0.9fr);
          gap: 20px;
        }

        .stats {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .stat-card,
        .panel {
          background: #fff;
          border-radius: 8px;
          box-shadow: 4px 5px 6px rgba(6, 7, 80, 0.22);
        }

        .stat-card {
          min-height: 174px;
          padding: 30px 24px;
          display: grid;
          align-content: center;
          gap: 11px;
        }

        .stat-icon {
          width: 32px;
          height: 32px;
          color: #070379;
        }

        .stat-label {
          font-size: 12px;
        }

        .stat-value {
          font-size: 38px;
          line-height: 0.9;
          font-weight: 500;
        }

        .stat-caption {
          color: #c4c6d3;
          font-size: 10px;
          text-transform: uppercase;
        }

        .panel {
          padding: 22px 24px;
          box-shadow: none;
        }

        .chart-panel {
          min-height: 302px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }

        .panel-title {
          margin: 0;
          font-size: 18px;
          line-height: 1;
          font-weight: 800;
        }

        .panel-subtitle,
        .view-all {
          font-size: 11px;
          color: #3e3e47;
        }

        .chart {
          width: 100%;
          height: 208px;
          display: block;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 36px;
          font-size: 11px;
          color: #5b5b69;
        }

        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .legend-line {
          width: 12px;
          height: 3px;
          border-radius: 999px;
          background: #080478;
        }

        .legend-line.orange { background: #ff7314; }

        .activity-list {
          display: grid;
          gap: 18px;
        }

        .activity-item {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 13px;
          align-items: center;
          font-size: 11px;
        }

        .activity-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #080478;
        }

        .activity-text {
          line-height: 1.25;
        }

        .activity-time {
          display: block;
          color: #242431;
        }

        .bottom-grid {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
          gap: 16px;
        }

        .trainer-list {
          display: grid;
          gap: 19px;
          padding: 8px 6px 0;
        }

        .trainer-row {
          display: grid;
          grid-template-columns: 28px 34px 1fr;
          gap: 12px;
          align-items: center;
          font-size: 11px;
        }

        .rank {
          font-size: 18px;
          font-weight: 700;
          text-align: right;
        }

        .trainer-photo {
          object-fit: cover;
          border-radius: 8px;
        }

        .trainer-photo {
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }

        .trainer-name {
          font-weight: 700;
          display: block;
        }

        .payment-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-top: 12px;
        }

        .payment-table td,
        .payment-table th {
          border: 0;
          padding: 14px 12px;
          text-align: center;
        }

        .payment-table th {
          background: #ffe08d;
          color: #111111;
          font-size: 13px;
          font-weight: 700;
        }

        .payment-table td {
          color: #111111;
          font-weight: 500;
        }

        .payment-table tbody tr {
          height: 48px;
        }

        .empty-state {
          color: #747884;
          font-size: 12px;
          padding: 18px 0 4px;
        }

        .dashboard-alert {
          background: #fff1f0;
          border-radius: 8px;
          color: #c73822;
          font-size: 13px;
          font-weight: 800;
          grid-column: 1 / -1;
          padding: 12px 14px;
        }

        .scan-toast-stack {
          display: grid;
          gap: 10px;
          max-width: min(360px, calc(100vw - 32px));
          position: fixed;
          right: 18px;
          top: 18px;
          z-index: 50;
        }

        .scan-toast {
          background: #fff;
          border-left: 4px solid #18a058;
          border-radius: 8px;
          box-shadow: 0 14px 28px rgba(6, 7, 80, 0.2);
          color: #05050c;
          padding: 14px 16px;
        }

        .scan-toast strong {
          display: block;
          font-size: 13px;
          line-height: 1.25;
          margin-bottom: 4px;
        }

        .scan-toast span {
          color: #747884;
          display: block;
          font-size: 11px;
          font-weight: 700;
        }

        @media (max-width: 1040px) {
          .admin-page {
            grid-template-columns: 92px minmax(0, 1fr);
          }

          .main {
            padding: 24px 16px;
          }

          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .content,
          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 680px) {
          .admin-page {
            display: block;
            width: 100%;
          }

          .main {
            padding: 20px 12px;
          }

          .topbar {
            padding: 0 4px 18px;
            align-items: center;
          }

          .topbar h1 {
            font-size: 24px;
          }

          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {scanNotifications.length > 0 && (
        <div className="scan-toast-stack" aria-live="polite">
          {scanNotifications.map((notification) => (
            <div className="scan-toast" key={notification.id}>
              <strong>{notification.message}</strong>
              <span>{notification.meta}</span>
            </div>
          ))}
        </div>
      )}

      <main className="admin-page">
        <AdminSidebar onLogout={handleLogout} />

        <section className="main">
          <header className="topbar">
            <div>
              <h1>Dashboard Admin</h1>
              <p>Kelola Dashboard Admin Anda</p>
            </div>
            <div className="profile">
              <Icon>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.7 19a2 2 0 0 1-3.4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </Icon>
              <span className="avatar">AD</span>
              <span className="profile-name">Admin <span>⌄</span></span>
            </div>
          </header>

          <div className="content">
            {error && <div className="dashboard-alert">{error}</div>}
            <section className="stats" aria-label="Ringkasan dashboard">
              {statCards.map((card) => (
                <article className="stat-card" key={card.label}>
                  <Icon className="stat-icon">
                    {card.icon === "news" ? (
                      <>
                        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </>
                    ) : card.icon === "trainer" ? (
                      <>
                        <path d="M7 8l10 10M17 8L7 18" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <path d="M4 11l3-3M17 18l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </>
                    ) : (
                      <>
                        <circle cx="9" cy="8" r="3" fill="currentColor" />
                        <circle cx="16" cy="9" r="2.4" fill="currentColor" />
                        <path d="M3.5 19a5.5 5.5 0 0 1 11 0M13.8 18a4.2 4.2 0 0 1 6.7 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </>
                    )}
                  </Icon>
                  <span className="stat-label">{card.label}</span>
                  <strong className="stat-value">{loading ? "..." : card.value}</strong>
                  <span className="stat-caption">{card.caption}</span>
                </article>
              ))}
            </section>

            <article className="panel chart-panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">Performa Platform</h2>
                  <span className="panel-subtitle">Transaksi sukses 30 hari terakhir</span>
                </div>
              </div>
              <svg className="chart" viewBox="0 0 640 202" role="img" aria-label="Grafik performa platform">
                {[0, 1, 2, 3, 4].map((line) => (
                  <line key={line} x1="48" y1={20 + line * 38} x2="628" y2={20 + line * 38} stroke="#d7d8df" strokeDasharray="3 3" />
                ))}
                {[0, 1, 2, 3, 4, 5].map((line) => (
                  <line key={line} x1={82 + line * 98} y1="18" x2={82 + line * 98} y2="174" stroke="#d7d8df" strokeDasharray="3 3" />
                ))}
                <path d={chart.path} fill="none" stroke="#ff7314" strokeWidth="2" />
                {chart.circles.map(([x, y], index) => (
                  <circle key={`${x}-${index}`} cx={x} cy={y} r="3" fill="#ff7314" />
                ))}
                {["100%", "75%", "50%", "25%", "0"].map((label, index) => (
                  <text key={label} x="12" y={24 + index * 38} fontSize="11" fill="#4f505c">{label}</text>
                ))}
                {chart.labels.map((label, index) => (
                  <text key={`${label}-${index}`} x={72 + index * 98} y="196" fontSize="11" fill="#4f505c">{label}</text>
                ))}
              </svg>
              <div className="chart-legend">
                <span className="legend-item"><span className="legend-line orange" /> Pendapatan (Rp)</span>
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Aktivitas Terbaru</h2>
                <span className="view-all">Lihat Semua</span>
              </div>
              <div className="activity-list">
                {activities.length === 0 && <p className="empty-state">Belum ada aktivitas.</p>}
                {activities.map(([text, time, color], index) => (
                  <div className="activity-item" key={text}>
                    <span className="activity-icon" style={{ background: color }}>
                      <Icon>
                        {index === 1 ? (
                          <path d="M7 12l3 3 7-7M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        ) : index === 2 ? (
                          <path d="M15 5l4 4-9 9H6v-4l9-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M6 19a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>
                        )}
                      </Icon>
                    </span>
                    <span className="activity-text">{text}{time && <span className="activity-time">({time})</span>}</span>
                  </div>
                ))}
              </div>
            </article>

            <section className="bottom-grid">
              <article className="panel">
                <h2 className="panel-title">Trainer Terpopuler Hari ini</h2>
                <div className="trainer-list">
                  {trainers.length === 0 && <p className="empty-state">Belum ada trainer.</p>}
                  {trainers.map((trainer, index) => (
                    <div className="trainer-row" key={trainer.name}>
                      <span className="rank">{index + 1}.</span>
                      <img className="trainer-photo" src={trainer.imageUrl || gymImage} alt="" />
                      <span><span className="trainer-name">{trainer.name}</span>{trainer.meta}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="panel">
                <h2 className="panel-title">Pembayaran Terbaru</h2>
                <table className="payment-table" aria-label="Pembayaran terbaru">
                  <tbody>
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan="4">Belum ada pembayaran.</td>
                      </tr>
                    )}
                    {payments.map((row) => (
                      <tr key={`${row[0]}-${row[3]}`}>
                        {row.map((cell) => <td key={cell}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>

            </section>
          </div>
        </section>
      </main>
    </>
  );
}
