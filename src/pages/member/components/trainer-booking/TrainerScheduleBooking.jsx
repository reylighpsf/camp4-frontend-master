import { useMemo, useState } from "react";
import gymImage from "../../../../assets/auth/signup-gym.jpg";

const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const getCatalogPrice = (catalog) => Number(catalog?.prices?.[0]?.price || 0);
const days = Array.from({ length: 30 }, (_, index) => index + 1);
const availability = {
  available: [3, 4, 8, 9, 10, 16, 17, 18, 22, 23, 26],
  booked: [15, 19, 25],
  limited: [11, 12],
  unavailable: [24, 29],
};

const getDayStatus = (day) => {
  if (availability.available.includes(day)) return "available";
  if (availability.booked.includes(day)) return "booked";
  if (availability.limited.includes(day)) return "limited";
  if (availability.unavailable.includes(day)) return "unavailable";
  return "";
};

export default function TrainerScheduleBookingModal({ catalogs = [], onClose, onConfirm, trainer }) {
  const [selectedCatalogCode, setSelectedCatalogCode] = useState(catalogs[0]?.code || "");
  const [selectedDay, setSelectedDay] = useState(26);
  const selectedCatalog = useMemo(
    () => catalogs.find((catalog) => catalog.code === selectedCatalogCode) || catalogs[0],
    [catalogs, selectedCatalogCode],
  );

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
              <b>{formatCurrency(getCatalogPrice(catalog))}</b>
            </button>
          ))}
        </section>

        <div className="book-body-grid">
          <section className="calendar-panel">
            <div className="calendar-head">
              <strong>June 2026</strong>
              <div>
                <button type="button" aria-label="Previous month">&lsaquo;</button>
                <button type="button" aria-label="Next month">&rsaquo;</button>
              </div>
            </div>
            <div className="calendar-week">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="calendar-grid">
              <span />
              {days.map((day) => {
                const status = getDayStatus(day);
                return (
                  <button
                    className={`${status} ${selectedDay === day ? "selected" : ""}`}
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    type="button"
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="calendar-legend">
              <span><i className="available" />Available</span>
              <span><i className="limited" />Limited Slot</span>
              <span><i className="booked" />Fully Booked</span>
              <span><i className="unavailable" />Unavailable</span>
            </div>
          </section>

          <aside className="booking-summary">
            <h2>Booking Summary</h2>
            <dl>
              <div><dt>Trainer</dt><dd>{trainer?.name || "-"}</dd></div>
              <div><dt>Date</dt><dd>Friday, June {selectedDay}, 2026</dd></div>
              <div><dt>Session Type</dt><dd>{selectedCatalog?.name || "-"}</dd></div>
            </dl>
            <button className="confirm-booking" onClick={() => selectedCatalog && onConfirm(selectedCatalog.code)} type="button">
              Confirm Booking
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
  width: min(100%, 760px);
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
  grid-template-columns: minmax(0, 1fr) 200px;
  gap: 40px;

  padding: 10px 22px 24px;
}

/* =========================================================
   CALENDAR
========================================================= */

.calendar-head {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 14px;
  padding: 0 8px;
}

.calendar-head strong {
  font-size: 15px;
}

.calendar-head button {
  background: transparent;
  border: none;

  color: #0b0871;
  font-size: 26px;
  line-height: 1;

  cursor: pointer;
}

.calendar-week,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 40px);
  gap: 10px;
}

.calendar-week span {
  text-align: center;

  color: #333;
  font-size: 13px;
}

.calendar-grid button {
  height: 42px;

  background: transparent;
  color: #111;

  border: 1px solid transparent;
  border-radius: 7px;

  cursor: pointer;
}

.calendar-grid button.available {
  background: #d9f7e3;
  border-color: #20b564;
}

.calendar-grid button.limited {
  background: #fff9d9;
  border-color: #ead36b;
}

.calendar-grid button.booked {
  background: #ffe1e1;
  border-color: #ff5363;
}

.calendar-grid button.unavailable {
  background: #d9dbe3;
  color: #6e7185;
}

.calendar-grid button.selected {
  box-shadow: inset 0 0 0 2px #0b0871;
}

/* =========================================================
   LEGEND
========================================================= */

.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  margin-top: 18px;
}

.calendar-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  font-size: 10px;
  color: #222;
}

.calendar-legend i {
  width: 8px;
  height: 8px;

  border-radius: 50%;
}

.calendar-legend .available {
  background: #20b564;
}

.calendar-legend .limited {
  background: #ead36b;
}

.calendar-legend .booked {
  background: #ff5363;
}

.calendar-legend .unavailable {
  background: #6e7185;
}

/* =========================================================
   BOOKING SUMMARY
========================================================= */

.booking-summary {
  align-self: start;

  padding: 18px 14px;

  background: #eef0fb;
  border-radius: 8px;
}

.booking-summary h2 {
  margin-bottom: 18px;

  font-size: 16px;
  font-weight: 700;
}

.booking-summary dl {
  display: grid;
  gap: 12px;

  margin-bottom: 16px;
}

.booking-summary dt {
  color: #6c6fa8;

  font-size: 11px;
  font-weight: 800;
}

.booking-summary dd {
  margin-top: 3px;

  color: #0b0871;
  font-size: 12px;
  font-weight: 800;
}

/* =========================================================
   BUTTONS
========================================================= */

.confirm-booking,
.cancel-booking {
  width: 100%;
  height: 32px;

  font-size: 12px;
  font-weight: 800;

  border-radius: 7px;
  cursor: pointer;
}

.confirm-booking {
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

  .calendar-week,
  .calendar-grid {
    grid-template-columns: repeat(7, minmax(28px, 1fr));
    gap: 6px;
  }
}
`;