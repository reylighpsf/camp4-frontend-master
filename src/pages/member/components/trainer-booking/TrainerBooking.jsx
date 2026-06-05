import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import MemberLayout from "../../../../components/member/MemberLayout";
import api from "../../../../components/auth/authApi";
import gymImage from "../../../../assets/auth/signup-gym.jpg";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const parseTrainerBio = (bio = "") => {
  const specialization = bio.match(/Spesialis:\s*(.+)/i)?.[1]?.trim() || bio || "Fitness";
  const price = bio.match(/Harga per sesi:\s*(.+)/i)?.[1]?.trim() || "";
  return { specialization, price };
};

const formatPrice = (value) => {
  const amount = Number(String(value).replace(/[^\d]/g, ""));
  if (!amount) return "50+ sessions";
  return `Rp ${amount.toLocaleString("id-ID")} / sesi`;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const toDatetimeLocalValue = (date) => {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path d="m16.5 16.5 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 6h16l-6 7v5l-4 2v-7L4 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export default function TrainerBookingPage() {
  const [trainers, setTrainers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [packageLoading, setPackageLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [packageError, setPackageError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [sessionStart, setSessionStart] = useState(() => {
    const next = new Date(Date.now() + 24 * 60 * 60 * 1000);
    next.setMinutes(next.getMinutes() < 30 ? 30 : 0, 0, 0);
    if (next.getMinutes() === 0) next.setHours(next.getHours() + 1);
    return toDatetimeLocalValue(next);
  });

  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/trainers");
      setTrainers(response.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat trainer."));
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    setPackageLoading(true);
    setPackageError("");
    try {
      const response = await api.get("/trainers/packages");
      setPackages(response.data?.data || []);
    } catch (err) {
      setPackageError(getErrorMessage(err, "Gagal memuat paket trainer."));
      setPackages([]);
    } finally {
      setPackageLoading(false);
    }
  }, []);

  const fetchPackageDetail = useCallback(async (packageId) => {
    setDetailLoading(true);
    setPackageError("");
    setActionMessage("");
    try {
      const response = await api.get(`/trainers/packages/${packageId}`);
      setSelectedPackage(response.data?.data || null);
    } catch (err) {
      setPackageError(getErrorMessage(err, "Gagal memuat detail paket trainer."));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchTrainerDetail = async (trainerId) => {
    setActionLoading(`trainer-${trainerId}`);
    setError("");
    try {
      const response = await api.get(`/trainers/${trainerId}`);
      setSelectedTrainer(response.data?.data || null);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat detail trainer."));
    } finally {
      setActionLoading("");
    }
  };

  const bookSession = async () => {
    if (!selectedPackage?.id) return;
    setActionLoading("book-session");
    setPackageError("");
    setActionMessage("");
    try {
      await api.post(`/trainers/packages/${selectedPackage.id}/sessions`, {
        startTime: new Date(sessionStart).toISOString(),
      });
      setActionMessage("Sesi trainer berhasil dibooking.");
      await fetchPackageDetail(selectedPackage.id);
      await fetchPackages();
    } catch (err) {
      setPackageError(getErrorMessage(err, "Gagal booking sesi trainer."));
    } finally {
      setActionLoading("");
    }
  };

  const cancelSession = async (sessionId) => {
    const reason = window.prompt("Alasan cancel sesi?", "Perubahan jadwal") || "";
    setActionLoading(`cancel-${sessionId}`);
    setPackageError("");
    setActionMessage("");
    try {
      await api.post(`/trainers/sessions/${sessionId}/cancel`, { reason });
      setActionMessage("Sesi trainer berhasil dicancel.");
      await fetchPackageDetail(selectedPackage.id);
      await fetchPackages();
    } catch (err) {
      setPackageError(getErrorMessage(err, "Gagal cancel sesi trainer."));
    } finally {
      setActionLoading("");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTrainers();
      fetchPackages();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchPackages, fetchTrainers]);

  const filteredTrainers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return trainers;

    return trainers.filter((trainer) => {
      const detail = parseTrainerBio(trainer.bio);
      return `${trainer.name} ${detail.specialization}`.toLowerCase().includes(keyword);
    });
  }, [query, trainers]);

  return (
    <MemberLayout active="Trainer Booking">
      <style>{`
        .trainer-booking-page {
          display: grid;
          gap: 28px;
          grid-template-columns: minmax(0, 1fr) 320px;
        }

        .trainer-booking-title {
          margin-bottom: 20px;
        }

        .trainer-booking-title h1 {
          color: #0b0871;
          font-family: 'Anton', sans-serif;
          font-size: 34px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
          margin: 0 0 8px;
        }

        .trainer-booking-title p {
          color: #292782;
          font-size: 14px;
          font-weight: 700;
          margin: 0;
        }

        .trainer-booking-toolbar {
          display: grid;
          gap: 16px;
          grid-template-columns: minmax(0, 1fr) 128px;
          margin-bottom: 14px;
        }

        .trainer-search,
        .trainer-filter {
          align-items: center;
          background: #f8f8fb;
          border-radius: 8px;
          color: #6f72a6;
          display: flex;
          gap: 12px;
          min-height: 54px;
          padding: 0 18px;
        }

        .trainer-search svg,
        .trainer-filter svg {
          height: 20px;
          width: 20px;
        }

        .trainer-search input {
          background: transparent;
          border: 0;
          color: #0b0871;
          flex: 1;
          font: inherit;
          font-size: 14px;
          outline: 0;
        }

        .trainer-filter {
          border: 0;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          justify-content: center;
        }

        .trainer-chips {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          margin-bottom: 28px;
        }

        .trainer-chip {
          background: #0b0871;
          border: 0;
          border-radius: 999px;
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          height: 40px;
          padding: 0 16px;
        }

        .trainer-list {
          display: grid;
          gap: 18px;
        }

        .trainer-card {
          align-items: stretch;
          background: #f8f8fb;
          border-radius: 12px;
          box-shadow: 0 10px 22px rgba(8, 4, 120, .08);
          display: grid;
          grid-template-columns: 116px minmax(0, 1fr);
          min-height: 142px;
          overflow: hidden;
        }

        .trainer-photo {
          height: 100%;
          min-height: 142px;
          object-fit: cover;
          width: 116px;
        }

        .trainer-card-body {
          padding: 20px 18px 16px;
        }

        .trainer-card-body h2 {
          color: #0b0871;
          font-size: 16px;
          font-weight: 900;
          margin: 0 0 3px;
        }

        .trainer-specialty {
          color: #292782;
          font-size: 12px;
          font-weight: 800;
          margin: 0 0 8px;
        }

        .trainer-meta {
          align-items: center;
          color: #292782;
          display: flex;
          flex-wrap: wrap;
          font-size: 12px;
          font-weight: 800;
          gap: 8px;
          margin-bottom: 7px;
        }

        .trainer-star {
          color: #ff7a00;
        }

        .trainer-desc {
          color: #292782;
          font-size: 10px;
          font-weight: 600;
          line-height: 1.4;
          margin: 0 0 12px;
          max-width: 620px;
        }

        .trainer-actions {
          display: flex;
          gap: 8px;
        }

        .trainer-action {
          border-radius: 5px;
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          font-weight: 900;
          height: 26px;
          padding: 0 12px;
        }

        .trainer-action.primary {
          background: #0b0871;
          border: 1px solid #0b0871;
          color: #fff;
        }

        .trainer-action.secondary {
          background: #fff;
          border: 1px solid #0b0871;
          color: #0b0871;
        }

        .trainer-status {
          background: #f8f8fb;
          border-radius: 12px;
          color: #6f72a6;
          padding: 28px;
          text-align: center;
        }

        .trainer-status.error {
          color: #c73822;
        }

        .session-panel {
          align-self: start;
          background: #f8f8fb;
          border-radius: 12px;
          margin-top: 82px;
          padding: 22px;
        }

        .session-head {
          align-items: center;
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .session-head h2 {
          color: #0b0871;
          font-size: 14px;
          font-weight: 900;
          margin: 0;
        }

        .session-head a {
          color: #ff7a00;
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
        }

        .session-card {
          align-items: center;
          background: #ffe1cc;
          border-radius: 12px;
          display: grid;
          gap: 20px;
          grid-template-columns: 70px minmax(0, 1fr);
          padding: 18px;
        }

        .session-date {
          background: #fff;
          border-radius: 8px;
          color: #ff7a00;
          display: grid;
          font-weight: 900;
          height: 76px;
          place-items: center;
          text-align: center;
        }

        .session-date span {
          display: block;
          font-size: 15px;
        }

        .session-date strong {
          display: block;
          font-size: 27px;
          line-height: 1;
        }

        .session-copy strong {
          color: #0b0871;
          display: block;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .session-copy h3 {
          color: #0b0871;
          font-size: 16px;
          font-weight: 900;
          margin: 0 0 5px;
        }

        .session-copy p {
          color: #292782;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.35;
          margin: 0 0 12px;
        }

        .session-location {
          align-items: center;
          color: #0b0871;
          display: flex;
          font-size: 13px;
          font-weight: 900;
          gap: 8px;
        }

        .session-location svg {
          color: #0b0871;
          height: 16px;
          width: 16px;
        }

        .package-list,
        .package-detail,
        .session-list {
          display: grid;
          gap: 12px;
        }

        .package-card,
        .package-detail-card,
        .session-item {
          background: #fff;
          border: 1px solid #eceef3;
          border-radius: 8px;
          padding: 14px;
        }

        .package-card {
          cursor: pointer;
          text-align: left;
        }

        .package-card strong,
        .package-detail-card strong,
        .session-item strong {
          color: #0b0871;
          display: block;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .package-card span,
        .package-detail-card span,
        .session-item span {
          color: #292782;
          display: block;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.45;
        }

        .package-card.active {
          border-color: #ff7a00;
          box-shadow: 0 0 0 2px rgba(255, 122, 0, .16);
        }

        .session-book-form {
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }

        .session-book-form input {
          border: 1px solid #d8dbe6;
          border-radius: 8px;
          color: #0b0871;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          min-height: 40px;
          padding: 0 10px;
        }

        .trainer-message {
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          margin: 0 0 12px;
          padding: 10px;
        }

        .trainer-message.error {
          background: #fff1f0;
          color: #c73822;
        }

        .trainer-message.success {
          background: #edfdf3;
          color: #16794c;
        }

        .trainer-detail-modal {
          align-items: center;
          background: rgba(8, 4, 120, .48);
          display: flex;
          inset: 0;
          justify-content: center;
          padding: 22px;
          position: fixed;
          z-index: 1000;
        }

        .trainer-detail-card {
          background: #fff;
          border-radius: 12px;
          max-width: 520px;
          padding: 22px;
          width: 100%;
        }

        .trainer-detail-card img {
          border-radius: 10px;
          height: 220px;
          object-fit: cover;
          width: 100%;
        }

        @media (max-width: 1120px) {
          .trainer-booking-page {
            grid-template-columns: 1fr;
          }

          .session-panel {
            margin-top: 0;
          }
        }

        @media (max-width: 760px) {
          .trainer-booking-toolbar {
            grid-template-columns: 1fr;
          }

          .trainer-chips {
            display: flex;
            overflow-x: auto;
          }

          .trainer-chip {
            flex: 0 0 auto;
          }

          .trainer-card {
            grid-template-columns: 96px minmax(0, 1fr);
          }

          .trainer-photo {
            width: 96px;
          }
        }
      `}</style>

      <section className="trainer-booking-page">
        <div>
          <div className="trainer-booking-title">
            <h1>Trainer Booking</h1>
            <p>Find and book your perfect fitness guide.</p>
          </div>

          <div className="trainer-booking-toolbar">
            <label className="trainer-search">
              <SearchIcon />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name by name or expertise..."
              />
            </label>
            <button className="trainer-filter" type="button">
              <FilterIcon />
              Filter
            </button>
          </div>

          <div className="trainer-chips">
            {["All Trainers", "Fitness", "Yoga", "Strength", "Cardio"].map((label) => (
              <button className="trainer-chip" key={label} type="button">
                {label}
              </button>
            ))}
          </div>

          <div className="trainer-list">
            {loading && <div className="trainer-status">Memuat trainer...</div>}
            {!loading && error && <div className="trainer-status error">{error}</div>}
            {!loading && !error && filteredTrainers.length === 0 && (
              <div className="trainer-status">Trainer tidak ditemukan.</div>
            )}
            {!loading && !error && filteredTrainers.map((trainer) => {
              const detail = parseTrainerBio(trainer.bio);
              return (
                <article className="trainer-card" key={trainer.id}>
                  <img className="trainer-photo" src={trainer.image_url || gymImage} alt="" />
                  <div className="trainer-card-body">
                    <h2>{trainer.name}</h2>
                    <p className="trainer-specialty">HIIT {detail.specialization}</p>
                    <div className="trainer-meta">
                      <span className="trainer-star">★</span>
                      <span>4.7</span>
                      <span>·</span>
                      <span>{formatPrice(detail.price)}</span>
                    </div>
                    <p className="trainer-desc">
                      “Let’s burn those calories! Specializing in high-intensity intervals that guarantee sweat and smiles.”
                    </p>
                    <div className="trainer-actions">
                      <button
                        className="trainer-action primary"
                        disabled={actionLoading === `trainer-${trainer.id}`}
                        onClick={() => fetchTrainerDetail(trainer.id)}
                        type="button"
                      >
                        View Profile
                      </button>
                      <Link className="trainer-action secondary" to={`/member/trainer-checkout?trainerId=${trainer.id}`}>Book Package</Link>
                      <Link className="trainer-action secondary" to="/member/trainer-packages">My Packages</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="session-panel" id="sessions">
          <div className="session-head">
            <h2>My Trainer Packages</h2>
            <a href="#sessions" onClick={(event) => { event.preventDefault(); fetchPackages(); }}>Refresh</a>
          </div>
          {packageError && <p className="trainer-message error">{packageError}</p>}
          {actionMessage && <p className="trainer-message success">{actionMessage}</p>}

          <div className="package-list">
            {packageLoading && <div className="trainer-status">Memuat paket trainer...</div>}
            {!packageLoading && packages.length === 0 && <div className="trainer-status">Belum ada paket trainer aktif.</div>}
            {!packageLoading && packages.map((pkg) => (
              <button
                className={`package-card ${selectedPackage?.id === pkg.id ? "active" : ""}`}
                key={pkg.id}
                onClick={() => fetchPackageDetail(pkg.id)}
                type="button"
              >
                <strong>{pkg.catalog_name || pkg.catalog_code}</strong>
                <span>Trainer: {pkg.trainer_name}</span>
                <span>Sisa sesi: {pkg.session_remaining}/{pkg.session_total}</span>
                <span>Status: {pkg.status}</span>
              </button>
            ))}
          </div>

          {detailLoading && <div className="trainer-status">Memuat detail package...</div>}
          {selectedPackage && !detailLoading && (
            <div className="package-detail">
              <article className="package-detail-card">
                <strong>{selectedPackage.catalog_name || selectedPackage.catalog_code}</strong>
                <span>Trainer: {selectedPackage.trainer_name}</span>
                <span>Berakhir: {formatDateTime(selectedPackage.expires_at)}</span>
                <span>Sisa sesi: {selectedPackage.session_remaining}/{selectedPackage.session_total}</span>

                <div className="session-book-form">
                  <input
                    min={toDatetimeLocalValue(new Date())}
                    onChange={(event) => setSessionStart(event.target.value)}
                    type="datetime-local"
                    value={sessionStart}
                  />
                  <button
                    className="trainer-action primary"
                    disabled={actionLoading === "book-session" || selectedPackage.status !== "ACTIVE"}
                    onClick={bookSession}
                    type="button"
                  >
                    {actionLoading === "book-session" ? "Booking..." : "Book Session"}
                  </button>
                </div>
              </article>

              <div className="session-list">
                {(selectedPackage.sessions || []).length === 0 && (
                  <div className="trainer-status">Belum ada jadwal sesi.</div>
                )}
                {(selectedPackage.sessions || []).map((session) => (
                  <article className="session-item" key={session.id}>
                    <strong>{formatDateTime(session.start_time)}</strong>
                    <span>Status: {session.status}</span>
                    <span>Booked by: {session.booked_by_name || "-"}</span>
                    {session.status === "BOOKED" && (
                      <button
                        className="trainer-action secondary"
                        disabled={actionLoading === `cancel-${session.id}`}
                        onClick={() => cancelSession(session.id)}
                        type="button"
                      >
                        {actionLoading === `cancel-${session.id}` ? "Cancel..." : "Cancel Session"}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      {selectedTrainer && (
        <div className="trainer-detail-modal">
          <article className="trainer-detail-card" role="dialog" aria-modal="true">
            <img src={selectedTrainer.image_url || gymImage} alt="" />
            <h2>{selectedTrainer.name}</h2>
            <p>{selectedTrainer.specialties || parseTrainerBio(selectedTrainer.bio).specialization}</p>
            <p>{selectedTrainer.bio || "Belum ada bio trainer."}</p>
            <div className="trainer-actions">
              <button className="trainer-action secondary" onClick={() => setSelectedTrainer(null)} type="button">
                Tutup
              </button>
            </div>
          </article>
        </div>
      )}
    </MemberLayout>
  );
}
