import { useCallback, useEffect, useMemo, useState } from "react";
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

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export default function TrainerBookingPage() {
  const [trainers, setTrainers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

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
                      <button className="trainer-action primary" type="button">View Profile</button>
                      <button className="trainer-action secondary" type="button">Book Sessions</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="session-panel">
          <div className="session-head">
            <h2>Upcoming Sessions</h2>
            <a href="#sessions">View details →</a>
          </div>
          <article className="session-card">
            <div className="session-date">
              <div>
                <span>MAY</span>
                <strong>31</strong>
              </div>
            </div>
            <div className="session-copy">
              <strong>Today, 09.00 PM</strong>
              <h3>HIIT Cardio Training</h3>
              <p>with Jeremiah Fisher</p>
              <span className="session-location">
                <PinIcon />
                Cardio Deck Area
              </span>
            </div>
          </article>
        </aside>
      </section>
    </MemberLayout>
  );
}
