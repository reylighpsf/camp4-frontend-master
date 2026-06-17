import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import MemberLayout from="../../../components/MemberLayout.jsx";
import MemberIcon from "@/features/member/components/MemberIcon";
import api from "@/services/authApi";
import { useAuth } from "@/hooks/useAuth";
import getSocket from "@/services/socket/socketClient";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const formatDate = (value) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));

const formatTime = (value) =>
  new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

const formatDuration = (start, end) => {
  if (!start || !end) return "-";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs <= 0) return "-";
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours <= 0) return `${remainingMinutes}m`;
  return `${hours}h ${remainingMinutes}m`;
};

const getMembershipEndFromTransaction = (transaction) => {
  if (!transaction || transaction.status !== "SUCCESS") return null;
  const family = String(transaction.transaction_family || "").toUpperCase();
  const type = String(transaction.transaction_type || "").toUpperCase();
  if (family !== "MEMBERSHIP" && !type.startsWith("MEMBERSHIP_")) return null;

  const start = new Date(transaction.settled_at || transaction.created_at);
  if (Number.isNaN(start.getTime())) return null;
  const days = type.includes("DAILY") ? 1 : type.includes("YEAR") ? 365 : 30;
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
};

const getStoredTapHistory = (userId) => {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(`vocafit-tap-history-${userId}`) || "[]");
  } catch {
    return [];
  }
};

export default function CheckInOutPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [qrToken, setQrToken] = useState("");
  const [showQr, setShowQr] = useState(true);
  const [crowd, setCrowd] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loadingQr, setLoadingQr] = useState(true);
  const [error, setError] = useState("");
  const [currentSession, setCurrentSession] = useState(null);
  const [tapRows, setTapRows] = useState(() => getStoredTapHistory(user?.id));
  const [membershipEndDate, setMembershipEndDate] = useState(null);
  const [isMembershipActive, setIsMembershipActive] = useState(false);
  const [membershipRemainingText, setMembershipRemainingText] = useState("Memuat status membership...");

  const fetchQr = useCallback(async () => {
    setLoadingQr(true);
    setError("");
    try {
      const response = await api.get("/visits/qr");
      setQrToken(response.data?.data?.qr || response.data?.data?.qrToken || "");
    } catch (err) {
      setError(getErrorMessage(err, "Gagal membuat QR code."));
      setQrToken("");
    } finally {
      setLoadingQr(false);
    }
  }, []);

  const fetchCrowd = useCallback(async () => {
    try {
      const response = await api.get("/visits/crowd");
      setCrowd(response.data?.data || null);
    } catch {
      setCrowd(null);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get("/users/me");
      setProfile(response.data?.data || null);
    } catch {
      setProfile(null);
    }
  }, []);

  const fetchMembershipStatus = useCallback(async () => {
    try {
      const response = await api.get("/transactions/history?limit=50");
      const transactions = response.data?.data || [];
      const membershipEnds = transactions
        .map(getMembershipEndFromTransaction)
        .filter(Boolean)
        .sort((a, b) => b.getTime() - a.getTime());
      const latestEnd = membershipEnds[0] || null;
      setMembershipEndDate(latestEnd);
      setIsMembershipActive(Boolean(latestEnd && latestEnd.getTime() > Date.now()));
    } catch {
      setMembershipEndDate(null);
      setIsMembershipActive(false);
    }
  }, []);

  const fetchVisitStatus = useCallback(async () => {
    try {
      const response = await api.get("/visits/status");
      const status = response.data?.data || null;
      setCurrentSession(
        status?.status === "INSIDE"
          ? { tapIn: status.tapInTime, tapOut: null }
          : null,
      );
    } catch {
      setCurrentSession(null);
    }
  }, []);

  const fetchVisitHistory = useCallback(async () => {
    try {
      const response = await api.get("/visits/history", { params: { page: 1, limit: 20 } });
      const rows = (response.data?.data || []).map((visit) => ({
        tapIn: visit.tap_in_time,
        tapOut: visit.tap_out_time,
      }));
      setTapRows(rows);
    } catch {
      setTapRows(getStoredTapHistory(user?.id));
    }
  }, [user?.id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProfile();
      fetchMembershipStatus();
      fetchVisitStatus();
      fetchVisitHistory();
      fetchQr();
      fetchCrowd();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchCrowd, fetchMembershipStatus, fetchProfile, fetchQr, fetchVisitHistory, fetchVisitStatus]);

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);
    const handleCrowdUpdate = (payload) => {
      setCrowd(payload?.data || payload || null);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("crowd_update", handleCrowdUpdate);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("crowd_update", handleCrowdUpdate);
    };
  }, []);

  const displayName = user?.full_name || user?.name || user?.email || "Member";
  const latestSession = currentSession || tapRows.find((row) => !row.tapOut) || tapRows[0] || null;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const profileEndDate = profile?.membership_end_date || profile?.membership?.end_date || user?.membership_end_date;
      const profileEffectiveEndDate = profileEndDate ? new Date(profileEndDate) : null;
      const effectiveEndDate = profileEffectiveEndDate || membershipEndDate;
      const membershipStatus = String(profile?.membership_status || profile?.membership?.status || "").toLowerCase();
      const activeByEndDate = Boolean(effectiveEndDate && effectiveEndDate.getTime() > Date.now());
      const activeByProfile =
        Boolean(profile?.active_membership) || membershipStatus === "active" || membershipStatus === "aktif";
      const active = activeByEndDate || isMembershipActive || activeByProfile;

      if (!active || !effectiveEndDate) {
        setMembershipRemainingText("Membership tidak aktif");
        return;
      }

      const diffMs = new Date(effectiveEndDate).getTime() - new Date().getTime();
      if (diffMs <= 0) {
        setMembershipRemainingText("Membership tidak aktif");
        return;
      }

      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      setMembershipRemainingText(`Sisa membership: ${days} hari`);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isMembershipActive, membershipEndDate, profile, user]);

  return (
    <MemberLayout active="Check In/Check Out">
<style>{`
  .tap-page {
    display: grid;
    gap: 30px;
  }

  .tap-title {
    color: #080478;
    font-family: "Anton", sans-serif;
    font-size: 34px;
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0;
  }

  .tap-grid {
    display: grid;
    grid-template-columns: minmax(360px, 1fr) minmax(330px, 0.95fr);
    gap: 32px;
  }

  .tap-card {
    padding: 28px;
    background: #f8f8fb;
    border-radius: 10px;
    box-shadow: 0 14px 28px rgba(8, 4, 120, 0.16);
  }

  /* =========================
     Profile
  ========================= */

  .tap-profile {
    display: flex;
    align-items: center;
    gap: 18px;

    padding-bottom: 18px;
    border-bottom: 1px solid #cfd0df;
  }

  .tap-avatar {
    width: 56px;
    height: 56px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    background: #766bd2;
    border: 2px solid #ff7a00;
    border-radius: 50%;

    color: #ffffff;
  }

  .tap-profile h2 {
    margin: 0 0 4px;

    color: #080478;
    font-size: 19px;
    font-weight: 900;
  }

  .tap-profile p {
    margin: 0;

    color: #44449b;
    font-size: 13px;
    font-weight: 700;
  }

  /* =========================
     QR Section
  ========================= */

  .qr-frame {
    width: min(260px, 100%);
    aspect-ratio: 1;

    display: grid;
    place-items: center;

    margin: 42px auto 34px;
    padding: 22px;

    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 0 22px rgba(8, 4, 120, 0.14);
  }

  .qr-frame svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .qr-token {
    max-width: 320px;
    margin: -18px auto 24px;

    overflow-wrap: anywhere;
    text-align: center;

    color: #080478;
    font-size: 11px;
    font-weight: 800;
  }

  .tap-error {
    margin: 0 0 14px;

    text-align: center;

    color: #c73822;
    font-size: 12px;
    font-weight: 800;
  }

  .tap-success {
    margin: 0 0 14px;

    text-align: center;

    color: #16794c;
    font-size: 12px;
    font-weight: 800;
  }

  /* =========================
     Actions
  ========================= */

  .tap-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;

    padding-bottom: 18px;
    border-bottom: 1px solid #cfd0df;
  }

  .tap-button {
    min-height: 36px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    border: 0;
    border-radius: 7px;

    cursor: pointer;

    color: #ffffff;

    font: inherit;
    font-size: 11px;
    font-weight: 800;
  }

  .tap-button.hide {
    background: #080478;
  }

  .tap-button.refresh {
    background: #ff7415;
  }

  .tap-help {
    margin: 18px 0 0;

    text-align: center;

    color: #44449b;
    font-size: 12px;
    font-weight: 700;
  }

  /* =========================
     Session
  ========================= */

  .session-title {
    margin: 0 0 26px;

    color: #080478;
    font-size: 24px;
    font-weight: 900;
  }

  .session-list {
    display: grid;
    gap: 22px;
  }

  .session-item > span {
    display: block;
    margin-bottom: 9px;

    color: #6867a9;
    font-size: 12px;
    font-weight: 800;
  }

  .session-box {
    min-height: 88px;

    display: flex;
    align-items: center;
    gap: 20px;

    padding: 16px 32px;
    border-radius: 8px;
  }

  .session-box.orange {
    background: #ffd8bd;
    border: 1.5px solid #ff7415;
    color: #ff7415;
  }

  .session-box.yellow {
    background: #fff6dd;
    border: 1.5px solid #ffd76a;
    color: #ffb100;
  }

  .session-box.blue {
    background: #c8c8e5;
    border: 1.5px solid #080478;
    color: #080478;
  }

  .session-icon {
    width: 56px;
    height: 56px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;

    border-radius: 10px;
    color: #ffffff;
    font-size: 26px;
    line-height: 1;
    margin: 0;
  }

  .session-icon svg {
    display: block;
    height: 30px;
    width: 30px;
  }

  .session-box.orange .session-icon {
    background: #ff7415;
  }

  .session-box.yellow .session-icon {
    background: #ffd76a;
  }

  .session-box.blue .session-icon {
    background: #080478;
  }

  .session-copy strong {
    display: block;

    font-size: 18px;
    font-weight: 900;
    line-height: 1.1;
  }

  .session-copy small {
    display: block;

    font-size: 11px;
    font-weight: 700;
    opacity: 0.75;
  }

  /* =========================
     Live Status
  ========================= */

  .live-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    margin-top: 14px;

    color: #44449b;
    font-size: 12px;
    font-weight: 800;
  }

  .live-dot {
    width: 9px;
    height: 9px;

    display: inline-block;

    background: #c1c1cc;
    border-radius: 50%;
  }

  .live-dot.connected {
    background: #18a058;
  }

  /* =========================
     History
  ========================= */

  .history-card {
    padding: 24px 28px 34px;

    background: #f8f8fb;
    border-radius: 10px;
    box-shadow: 0 14px 28px rgba(8, 4, 120, 0.12);
  }

  .history-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;

    margin-bottom: 28px;
  }

  .history-head h2 {
    margin: 0 0 4px;

    color: #080478;
    font-size: 20px;
    font-weight: 900;
  }

  .history-head p {
    margin: 0;

    color: #44449b;
    font-size: 12px;
    font-weight: 700;
  }

  .history-select {
    height: 42px;
    min-width: 72px;

    padding: 0 12px;

    border: 0;
    border-radius: 5px;

    background: #080478;
    color: #ffffff;

    font: inherit;
    font-weight: 900;
  }

  /* =========================
     Table
  ========================= */

  .tap-table {
    width: 100%;
    border-collapse: collapse;

    color: #05050c;
    font-size: 13px;
  }

  .tap-table th {
    padding: 16px 18px;

    background: #d8d8e8;

    color: #080478;
    font-weight: 900;
    text-align: left;
  }

  .tap-table td {
    padding: 18px;

    background: #ffffff;
    border-bottom: 1px solid #e4e4ef;
  }

  /* =========================
     Responsive
  ========================= */

  @media (max-width: 1040px) {
    .tap-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 680px) {
    .tap-title {
      font-size: 30px;
    }

    .tap-card,
    .history-card {
      padding: 20px;
    }

    .tap-actions {
      grid-template-columns: 1fr;
    }

    .history-table-wrap {
      overflow-x: auto;
    }

    .tap-table {
      min-width: 620px;
    }
  }
`}</style>

      <section className="tap-page">
        <h1 className="tap-title">Tap In/Tap Out</h1>

        <div className="tap-grid">
          <article className="tap-card">
            <div className="tap-profile">
              <span className="tap-avatar"><MemberIcon name="flower" /></span>
              <div>
                <h2>{displayName}</h2>
                <p>{membershipRemainingText}</p>
              </div>
            </div>

            <div className="qr-frame">
              {!showQr ? (
                <p>QR disembunyikan</p>
              ) : loadingQr ? (
                <p>Memuat QR...</p>
              ) : qrToken ? (
                <QRCodeSVG value={qrToken} size={216} level="M" includeMargin />
              ) : (
                <p>QR tidak tersedia</p>
              )}
            </div>
            {error && <p className="tap-error">{error}</p>}
            <div className="tap-actions">
              <button className="tap-button hide" onClick={() => setShowQr((current) => !current)} type="button">
                {showQr ? "Hide QR Code" : "Show QR Code"}
              </button>
              <button className="tap-button refresh" onClick={fetchQr} type="button">Refresh QR</button>
            </div>
            <p className="tap-help">Show this QR code at the entrance gate.</p>
          </article>

          <aside className="tap-card">
            <h2 className="session-title">Today’s Session</h2>
            <div className="session-list">
              <div className="session-item">
                <span>Tap-In Status</span>
                <div className="session-box orange">
                  <span className="session-icon"><MemberIcon name="login" /></span>
                  <div className="session-copy">
                    <small>{latestSession && !latestSession.tapOut ? "Currently inside" : "Gym condition"}</small>
                    <strong>{latestSession && !latestSession.tapOut ? "Checked In" : crowd?.status || "Unknown"}</strong>
                  </div>
                </div>
              </div>
              <div className="session-item">
                <span>Latest Activity</span>
                <div className="session-box yellow">
                  <span className="session-icon">◷</span>
                  <div className="session-copy">
                    <strong>{latestSession ? formatTime(latestSession.tapOut || latestSession.tapIn) : `${crowd?.count ?? "-"} visitors`}</strong>
                    <small>{latestSession ? (latestSession.tapOut ? "Last tap out" : "Last tap in") : "Current live crowd"}</small>
                  </div>
                </div>
              </div>
              <div className="session-item">
                <span>Workout Duration</span>
                <div className="session-box blue">
                  <span className="session-icon">↻</span>
                  <div className="session-copy">
                    <strong>{latestSession ? formatDuration(latestSession.tapIn, latestSession.tapOut || new Date()) : "-"}</strong>
                    <small>Time in gym</small>
                  </div>
                </div>
              </div>
            </div>
            <p className="live-status">
              <span className={`live-dot ${socketConnected ? "connected" : ""}`} />
              {socketConnected ? "Live connected" : "Live offline"}
            </p>
         </aside>
        </div>

        <section className="history-card">
          <div className="history-head">
            <div>
              <h2>Tap History</h2>
              <p>Recent gym access logs</p>
            </div>
            <select className="history-select" defaultValue="10" aria-label="Jumlah data">
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>

          <div className="history-table-wrap">
            <table className="tap-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tap In</th>
                  <th>Tap Out</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {tapRows.length === 0 && (
                  <tr>
                    <td colSpan="4">Belum ada riwayat tap dari halaman ini.</td>
                  </tr>
                )}
                {tapRows.map((row) => (
                  <tr key={`${row.tapIn}-${row.tapOut || "active"}`}>
                    <td>{formatDate(row.tapIn)}</td>
                    <td>{formatTime(row.tapIn)}</td>
                    <td>{row.tapOut ? formatTime(row.tapOut) : "Aktif"}</td>
                    <td>{formatDuration(row.tapIn, row.tapOut)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </MemberLayout>
  );
}
