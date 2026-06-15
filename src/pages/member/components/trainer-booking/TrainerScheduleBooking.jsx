import { useEffect, useMemo, useState } from "react";
import api from "../../../../components/auth/hooks/authApi";
import gymImage from "../../../../assets/auth/signup-gym.jpg";
import { getCatalogPrice } from "../../../auth/membership/hooks/authPlans";

const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const toDateKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => new Date(year, month, index + 1)),
  ];
};

const formatMonth = (date) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);

const normalizeBookings = (payload) => {
  const data = payload?.data || payload || [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.bookings)) return data.bookings;
  if (Array.isArray(data.sessions)) return data.sessions;
  return [];
};

export default function TrainerScheduleBookingModal({ catalogs = [], onClose, onConfirm, tierCode = "", trainer }) {
  const [selectedCatalogCode, setSelectedCatalogCode] = useState(catalogs[0]?.code || "");
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [bookings, setBookings] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const selectedCatalog = useMemo(
    () => catalogs.find((catalog) => catalog.code === selectedCatalogCode) || catalogs[0],
    [catalogs, selectedCatalogCode],
  );
  const bookedDates = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      const key = toDateKey(booking.start_time || booking.startTime || booking.date);
      if (!key) return;
      map.set(key, [...(map.get(key) || []), booking]);
    });
    return map;
  }, [bookings]);
  const calendarDays = useMemo(() => getCalendarDays(monthDate), [monthDate]);

  useEffect(() => {
    if (!trainer?.id) return undefined;

    let mounted = true;
    const fetchTrainerBookings = async () => {
      setScheduleLoading(true);
      setScheduleError("");
      try {
        const response = await api.get(`/trainers/sessions/trainer/${trainer.id}`, {
          params: { page: 1, limit: 100 },
        });
        if (mounted) setBookings(normalizeBookings(response.data));
      } catch (err) {
        if (!mounted) return;
        setBookings([]);
        setScheduleError(
          err.response?.status === 404
            ? "Data booking trainer belum tersedia."
            : err.response?.data?.message || err.response?.data?.error || "Gagal memuat schedule trainer.",
        );
      } finally {
        if (mounted) setScheduleLoading(false);
      }
    };

    fetchTrainerBookings();
    return () => {
      mounted = false;
    };
  }, [trainer?.id]);

  return (
    <div className="book-session-backdrop">
      <style>{styles}</style>
      <section className="book-session-card" role="dialog" aria-modal="true">
        <header className="book-session-head">
          <div>
            <h1>Book Session</h1>
            <div className="book-trainer-mini">
              <img src={trainer?.image_url || gymImage} alt="" />
              <div>
                <strong>{trainer?.name || "Trainer"}</strong>
                <span>HIIT Cardio</span>
              </div>
            </div>
          </div>
          <button className="book-close" onClick={onClose} type="button" aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        <section className="book-package-grid">
          {catalogs.map((catalog) => (
            <button
              className={`book-package-card ${catalog.code === selectedCatalogCode ? "active" : ""}`}
              key={catalog.code}
              onClick={() => setSelectedCatalogCode(catalog.code)}
              type="button"
            >
              <strong>{catalog.name}</strong>
              <span>{catalog.session_count || 10} sessions / {catalog.group_size || 1} person</span>
              <b>{formatCurrency(getCatalogPrice(catalog, tierCode))}</b>
            </button>
          ))}
        </section>

        <div className="book-body-grid">
          <section className="calendar-panel">
            <div className="calendar-head">
              <strong>{formatMonth(monthDate)}</strong>
              <div>
                <button
                  onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
                  type="button"
                  aria-label="Previous month"
                >
                  &lsaquo;
                </button>
                <button
                  onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
                  type="button"
                  aria-label="Next month"
                >
                  &rsaquo;
                </button>
              </div>
            </div>
            <div className="calendar-week">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {calendarDays.map((date, index) => {
                if (!date) return <span key={`empty-${index}`} />;
                const dateKey = toDateKey(date);
                const isBooked = bookedDates.has(dateKey);
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                return (
                  <button
                    className={`${isBooked ? "booked" : "available"} ${isPast ? "unavailable" : ""}`}
                    key={dateKey}
                    type="button"
                    title={isBooked ? `${bookedDates.get(dateKey).length} booking` : "Available"}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="calendar-legend">
              <span><i className="available" />Available</span>
              <span><i className="booked" />Booked</span>
              <span><i className="unavailable" />Past date</span>
            </div>
            {scheduleLoading && <p className="schedule-note">Memuat schedule trainer...</p>}
            {scheduleError && <p className="schedule-note error">{scheduleError}</p>}
          </section>

          <aside className="booking-summary">
            <h2>Package Summary</h2>
            <dl>
              <div><dt>Trainer</dt><dd>{trainer?.name || "-"}</dd></div>
              <div><dt>Package</dt><dd>{selectedCatalog?.name || "-"}</dd></div>
              <div><dt>Sesi</dt><dd>{selectedCatalog?.session_count || 10} sessions / {selectedCatalog?.group_size || 1} person</dd></div>
              <div><dt>Harga</dt><dd>{formatCurrency(getCatalogPrice(selectedCatalog, tierCode))}</dd></div>
            </dl>
            <button className="confirm-booking" onClick={() => selectedCatalog && onConfirm(selectedCatalog.code)} type="button">
              Continue Checkout
            </button>
            <button className="cancel-booking" onClick={onClose} type="button">
              Cancel
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const styles = `
/* =========================================================
   BACKDROP & MODAL
========================================================= */

.book-session-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 18px;

  background: rgba(8, 4, 120, 0.48);
}

.book-session-card {
  width: min(100%, 930px);
  max-height: calc(100vh - 36px);

  overflow: auto;

  background: #f8f9fc;
  color: #0b0871;

  border-radius: 8px;
  box-shadow: 0 22px 50px rgba(4, 2, 64, 0.18);
}

/* =========================================================
   HEADER
========================================================= */

.book-session-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  padding: 18px 22px 16px;

  background: #fff;
  border-bottom: 1px solid #d8dbe9;
}

.book-session-head h1 {
  margin: 0 0 14px;

  font-size: 14px;
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.book-close {
  width: 34px;
  height: 34px;

  border: none;
  background: transparent;

  color: #0b0871;
  cursor: pointer;
}

.book-close svg {
  width: 20px;
  height: 20px;
}

/* =========================================================
   TRAINER INFO
========================================================= */

.book-trainer-mini {
  display: flex;
  align-items: center;
  gap: 10px;
}

.book-trainer-mini img {
  width: 34px;
  height: 34px;

  object-fit: cover;
  border-radius: 50%;
}

.book-trainer-mini strong,
.book-trainer-mini span {
  display: block;
}

.book-trainer-mini strong {
  font-size: 12px;
  font-weight: 900;
}

.book-trainer-mini span {
  color: #ff6414;

  font-size: 10px;
  font-weight: 900;
}

/* =========================================================
   PACKAGE SECTION
========================================================= */

.book-package-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  padding: 18px;
}

.book-package-card {
  display: grid;
  gap: 5px;

  min-height: 86px;
  padding: 16px;

  text-align: left;
  cursor: pointer;

  color: #0b0871;
  background: #d5d7e9;

  border: 1px solid transparent;
  border-radius: 8px;

  transition: all 0.2s ease;
}

.book-package-card:hover {
  transform: translateY(-2px);
}

.book-package-card.active {
  background: #f4f5fb;
  border-color: #ff6414;
}

.book-package-card strong {
  font-size: 18px;
  font-weight: 700;
}

.book-package-card span {
  color: #ff6414;

  font-size: 11px;
  font-weight: 700;
}

.book-package-card b {
  font-size: 18px;
}

/* =========================================================
   BODY LAYOUT
========================================================= */

.book-body-grid {
  display: grid;
  align-items: stretch;
  grid-template-columns: minmax(360px, 1fr) minmax(280px, .95fr);
  gap: 20px;
  padding: 0 22px 24px;
}

/* =========================================================
   CALENDAR
========================================================= */

.calendar-panel {
  background: #fff;
  border: 1px solid #e1e4ee;
  border-radius: 8px;
  display: grid;
  grid-template-rows: auto auto auto auto auto;
  padding: 18px;
}

.calendar-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.calendar-head strong {
  font-size: 16px;
  font-weight: 900;
}

.calendar-head div {
  display: inline-flex;
  gap: 8px;
}

.calendar-head button {
  background: #f3f4fb;
  border: 1px solid #d8dbe6;
  border-radius: 7px;
  color: #0b0871;
  cursor: pointer;
  font-size: 17px;
  font-weight: 900;
  height: 34px;
  width: 34px;
}

.calendar-week,
.calendar-grid {
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.calendar-week {
  color: #292782;
  font-size: 11px;
  font-weight: 900;
  margin-bottom: 8px;
  text-align: center;
}

.calendar-grid button,
.calendar-grid span {
  border-radius: 7px;
  height: 42px;
  min-height: 0;
}

.calendar-grid button {
  border: 1px solid transparent;
  color: #0b0871;
  cursor: default;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
}

.calendar-grid button.available {
  background: #dcfae7;
  border-color: #24c870;
}

.calendar-grid button.booked {
  background: #ffe6e8;
  border-color: #ff5365;
}

.calendar-grid button.unavailable {
  background: #d9dbe3;
  border-color: #d9dbe3;
  color: #6e7185;
}

.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.calendar-legend span {
  align-items: center;
  color: #292782;
  display: inline-flex;
  font-size: 11px;
  font-weight: 800;
  gap: 6px;
}

.calendar-legend i {
  border-radius: 999px;
  height: 9px;
  width: 9px;
}

.calendar-legend .available { background: #24c870; }
.calendar-legend .booked { background: #ff5365; }
.calendar-legend .unavailable { background: #6e7185; }

.schedule-note {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  color: #9a3412;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
  margin: 12px 0 0;
  padding: 9px 10px;
}

.schedule-note.error {
  color: #9a3412;
}

/* =========================================================
   BOOKING SUMMARY
========================================================= */

.booking-summary {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  padding: 18px;

  background: #eef0fb;
  border-radius: 8px;
}

.booking-summary h2 {
  margin: 0 0 22px;

  font-size: 18px;
  font-weight: 900;
}

.booking-summary dl {
  display: grid;
  gap: 16px;

  margin: 0 0 22px;
}

.booking-summary dt {
  color: #6c6fa8;

  font-size: 12px;
  font-weight: 900;
}

.booking-summary dd {
  margin: 4px 0 0;

  color: #0b0871;
  font-size: 13px;
  font-weight: 900;
}

/* =========================================================
   BUTTONS
========================================================= */

.confirm-booking,
.cancel-booking {
  width: 100%;
  min-height: 40px;

  font-size: 12px;
  font-weight: 800;

  border-radius: 7px;
  cursor: pointer;
}

.confirm-booking {
  margin-top: auto;
  background: #0b0871;
  color: #fff;
  border: 1px solid #0b0871;
}

.cancel-booking {
  margin-top: 8px;

  background: #fff;
  color: #0b0871;

  border: 1px solid #0b0871;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 760px) {
  .book-package-grid,
  .book-body-grid {
    grid-template-columns: 1fr;
  }
}
`;
