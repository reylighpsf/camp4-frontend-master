import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import MemberLayout from "@/features/member/components/MemberLayout";
import api from "@/services/authApi";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
};

const toDatetimeLocalValue = () => {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() < 30 ? 30 : 0, 0, 0);
  if (date.getMinutes() === 0) date.setHours(date.getHours() + 1);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function TrainerPackagesPage() {
  const { packageId } = useParams();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [sessionStart, setSessionStart] = useState(toDatetimeLocalValue);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/trainers/packages");
      setPackages(response.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat trainer packages."));
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPackageDetail = useCallback(async (id) => {
    if (!id) return;
    setDetailLoading(true);
    setError("");
    try {
      const response = await api.get(`/trainers/packages/${id}`);
      setSelectedPackage(response.data?.data || null);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat detail package."));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchPackages, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchPackages]);

  useEffect(() => {
    if (!packageId) return undefined;
    const timeoutId = setTimeout(() => fetchPackageDetail(packageId), 0);
    return () => clearTimeout(timeoutId);
  }, [fetchPackageDetail, packageId]);

  const bookSession = async () => {
    if (!selectedPackage?.id) return;
    setActionLoading("book");
    setError("");
    setMessage("");
    try {
      await api.post(`/trainers/packages/${selectedPackage.id}/sessions`, {
        startTime: new Date(sessionStart).toISOString(),
      });
      setMessage("Sesi berhasil dibooking.");
      await fetchPackageDetail(selectedPackage.id);
      await fetchPackages();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal booking sesi."));
    } finally {
      setActionLoading("");
    }
  };

  const cancelSession = async (sessionId) => {
    const reason = window.prompt("Alasan cancel sesi?", "Perubahan jadwal") || "";
    setActionLoading(sessionId);
    setError("");
    setMessage("");
    try {
      await api.post(`/trainers/sessions/${sessionId}/cancel`, { reason });
      setMessage("Sesi berhasil dicancel.");
      await fetchPackageDetail(selectedPackage.id);
      await fetchPackages();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal cancel sesi."));
    } finally {
      setActionLoading("");
    }
  };

  return (
    <MemberLayout active="Trainer Packages">
      <style>{styles}</style>
      <section className="trainer-package-page">
        <header className="tp-head">
          <div>
            <h1>My Trainer Packages</h1>
            <p>Kelola package, jadwal sesi, dan booking trainer.</p>
          </div>
          <Link className="tp-link" to="/member/trainer-checkout">Beli Package</Link>
        </header>

        {error && <p className="tp-alert error">{error}</p>}
        {message && <p className="tp-alert success">{message}</p>}

        <div className="tp-grid">
          <section className="tp-panel">
            <h2>Packages</h2>
            {loading && <p>Memuat packages...</p>}
            {!loading && packages.length === 0 && <p>Belum ada paket trainer aktif.</p>}
            <div className="tp-cards">
              {packages.map((pkg) => (
                <Link
                  className={`tp-card ${selectedPackage?.id === pkg.id ? "active" : ""}`}
                  key={pkg.id}
                  onClick={() => fetchPackageDetail(pkg.id)}
                  to={`/member/trainer-packages/${pkg.id}`}
                >
                  <strong>{pkg.catalog_name || pkg.catalog_code}</strong>
                  <span>Trainer: {pkg.trainer_name}</span>
                  <span>Sisa sesi: {pkg.session_remaining}/{pkg.session_total}</span>
                  <b>{pkg.status}</b>
                </Link>
              ))}
            </div>
          </section>

          <section className="tp-panel">
            <h2>Detail Package</h2>
            {detailLoading && <p>Memuat detail...</p>}
            {!detailLoading && !selectedPackage && <p>Pilih package untuk melihat detail.</p>}
            {selectedPackage && !detailLoading && (
              <>
                <div className="tp-summary">
                  <span>Package</span><strong>{selectedPackage.catalog_name || selectedPackage.catalog_code}</strong>
                  <span>Trainer</span><strong>{selectedPackage.trainer_name}</strong>
                  <span>Expired</span><strong>{formatDateTime(selectedPackage.expires_at)}</strong>
                  <span>Sesi</span><strong>{selectedPackage.session_remaining}/{selectedPackage.session_total}</strong>
                </div>

                <div className="tp-book">
                  <input type="datetime-local" value={sessionStart} onChange={(event) => setSessionStart(event.target.value)} />
                  <button disabled={actionLoading === "book" || selectedPackage.status !== "ACTIVE"} onClick={bookSession} type="button">
                    {actionLoading === "book" ? "Booking..." : "Book Session"}
                  </button>
                </div>

                <h3>Jadwal Sesi</h3>
                <div className="tp-sessions">
                  {(selectedPackage.sessions || []).length === 0 && <p>Belum ada jadwal sesi.</p>}
                  {(selectedPackage.sessions || []).map((session) => (
                    <article className="tp-session" key={session.id}>
                      <strong>{formatDateTime(session.start_time)}</strong>
                      <span>Status: {session.status}</span>
                      <span>Booked by: {session.booked_by_name || "-"}</span>
                      {session.status === "BOOKED" && (
                        <button disabled={actionLoading === session.id} onClick={() => cancelSession(session.id)} type="button">
                          {actionLoading === session.id ? "Cancel..." : "Cancel Session"}
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </MemberLayout>
  );
}

const styles = `
  .trainer-package-page {
    display: grid;
    gap: 22px;
  }
  .tp-head {
    align-items: center;
    display: flex;
    justify-content: space-between;
    gap: 18px;
  }
  .tp-head h1 {
    font-family: Anton, sans-serif;
    font-size: 34px;
    font-weight: 400;
    margin: 0 0 6px;
  }
  .tp-head p {
    font-weight: 800;
    margin: 0;
  }
  .tp-link {
    background: #ff7415;
    border-radius: 8px;
    color: #fff;
    font-weight: 900;
    min-height: 42px;
    padding: 11px 16px;
    text-decoration: none;
  }
  .tp-grid {
    display: grid;
    gap: 22px;
    grid-template-columns: minmax(0, .9fr) minmax(420px, 1.1fr);
  }
  .tp-panel {
    background: #f8f8fb;
    border-radius: 10px;
    padding: 24px;
  }
  .tp-panel h2 {
    font-size: 18px;
    margin: 0 0 16px;
  }
  .tp-cards, .tp-sessions {
    display: grid;
    gap: 12px;
  }
  .tp-card, .tp-session {
    background: #fff;
    border: 1px solid #eceef3;
    border-radius: 8px;
    color: #0b0871;
    display: grid;
    gap: 6px;
    padding: 16px;
    text-decoration: none;
  }
  .tp-card.active {
    border-color: #ff7415;
    box-shadow: 0 0 0 2px rgba(255,116,21,.16);
  }
  .tp-card span, .tp-session span {
    color: #5f6296;
    font-weight: 800;
  }
  .tp-summary {
    display: grid;
    gap: 8px;
    grid-template-columns: 96px 1fr;
    margin-bottom: 16px;
  }
  .tp-summary span {
    color: #5f6296;
    font-weight: 800;
  }
  .tp-book {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 150px;
    margin-bottom: 20px;
  }
  .tp-book input {
    border: 1px solid #d8dbe6;
    border-radius: 8px;
    font: inherit;
    padding: 0 10px;
  }
  .tp-book button, .tp-session button {
    background: #0b0871;
    border: 0;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    font: inherit;
    font-weight: 900;
    min-height: 40px;
    padding: 0 12px;
  }
  .tp-book button:disabled, .tp-session button:disabled {
    cursor: not-allowed;
    opacity: .6;
  }
  .tp-alert {
    border-radius: 8px;
    font-weight: 900;
    padding: 12px 14px;
  }
  .tp-alert.error {
    background: #fff1f0;
    color: #c73822;
  }
  .tp-alert.success {
    background: #edfdf3;
    color: #16794c;
  }
  @media (max-width: 980px) {
    .tp-grid {
      grid-template-columns: 1fr;
    }

    .tp-book {
      grid-template-columns: 1fr;
    }

    .tp-head {
      align-items: stretch;
      flex-direction: column;
    }
  }
`;
