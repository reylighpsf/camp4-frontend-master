import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import MemberLayout from "@/components/member/MemberLayout";
import api from "@/components/auth/hooks/authApi";
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

const getExpertiseList = (trainer) => {
  const detail = parseTrainerBio(trainer?.bio);
  const source = trainer?.specialties || detail.specialization || "HIIT, Cardio, Stamina, Fat Burn";
  const items = String(source)
    .split(/[,|/]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items.slice(0, 4) : ["HIIT", "Cardio", "Stamina", "Fat Burn"];
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

const toDateInputValue = (date) => toDatetimeLocalValue(date).slice(0, 10);
const combineDateTime = (dateValue, timeValue) => `${dateValue}T${timeValue}`;
const getDateKey = (value) => toDateInputValue(new Date(value));
const monthLabel = (date) => new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
const normalizeSessionStartTime = (value) => {
  const [datePart, rawTimePart = ""] = String(value || "").split("T");
  if (!datePart) return "";
  const [rawHour = "0", rawMinute = "0"] = rawTimePart.split(":");
  const hour = Math.min(Math.max(Number(rawHour) || 6, 6), 18);
  const minute = Number(rawMinute) >= 30 ? 30 : 0;
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 7, minute, 0, 0)).toISOString();
};

const timeOptions = Array.from({ length: 25 }, (_, index) => {
  const totalMinutes = 6 * 60 + index * 30;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

const canMemberCancelSession = (startTime) => {
  if (!startTime) return false;
  const today = new Date();
  const sessionDate = new Date(startTime);
  today.setHours(0, 0, 0, 0);
  sessionDate.setHours(0, 0, 0, 0);
  const daysBeforeSession = Math.ceil((sessionDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  return daysBeforeSession >= 2;
};

const getCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDate = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDate.getDay() }, () => null);
  const days = Array.from({ length: totalDays }, (_, index) => new Date(year, month, index + 1));
  return [...blanks, ...days];
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
  const [packageSchedules, setPackageSchedules] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [packageLoading, setPackageLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
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
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const trainerResponse = await api.get("/trainers");
      setTrainers(trainerResponse.data?.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat trainer."));
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    setPackageLoading(true);
    setScheduleLoading(true);
    setPackageError("");
    try {
      const response = await api.get("/trainers/packages");
      const nextPackages = response.data?.data || [];
      setPackages(nextPackages);

      const detailResults = await Promise.allSettled(
        nextPackages.map((pkg) => api.get(`/trainers/packages/${pkg.id}`)),
      );
      setPackageSchedules(
        detailResults
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value.data?.data)
          .filter(Boolean),
      );
    } catch (err) {
      setPackageError(getErrorMessage(err, "Gagal memuat paket trainer."));
      setPackages([]);
      setPackageSchedules([]);
    } finally {
      setPackageLoading(false);
      setScheduleLoading(false);
    }
  }, []);

  const fetchPackageDetail = useCallback(async (packageId, { openModal = false } = {}) => {
    setDetailLoading(true);
    setPackageError("");
    setActionMessage("");
    try {
      const response = await api.get(`/trainers/packages/${packageId}`);
      const detail = response.data?.data || null;
      setSelectedPackage(detail);
      if (openModal) setIsPackageModalOpen(true);
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
        startTime: normalizeSessionStartTime(sessionStart),
      });
      setActionMessage("Sesi trainer berhasil dibooking.");
      await fetchPackageDetail(selectedPackage.id);
      await fetchPackages();
      setCalendarMonth(new Date(sessionStart));
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

  const selectedDateValue = sessionStart.slice(0, 10);
  const selectedTimeValue = sessionStart.slice(11, 16);
  const memberScheduleItems = useMemo(() => {
    return packageSchedules
      .flatMap((pkg) =>
        (pkg.sessions || []).map((session) => ({
          ...session,
          packageName: pkg.catalog_name || pkg.catalog_code,
          trainerName: pkg.trainer_name,
        })),
      )
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [packageSchedules]);
  const bookedDateKeys = useMemo(() => {
    return new Set(
      (selectedPackage?.sessions || [])
        .filter((session) => String(session.status || "").toUpperCase() === "BOOKED")
        .map((session) => getDateKey(session.start_time)),
    );
  }, [selectedPackage]);
  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);
  const closePackageModal = () => {
    if (actionLoading === "book-session") return;
    setIsPackageModalOpen(false);
  };
  const renderScheduleCalendar = (compact = false) => (
    <section className={`package-calendar-card ${compact ? "compact" : ""}`}>
      <div className="package-calendar-top">
        <h3>{monthLabel(calendarMonth)}</h3>
        <div className="package-calendar-nav">
          <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} type="button">‹</button>
          <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} type="button">›</button>
        </div>
      </div>
      <div className="package-calendar-week">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="package-calendar-grid">
        {calendarDays.map((date, index) => {
          if (!date) return <span className="package-calendar-empty" key={`empty-${index}`} />;
          const dateValue = toDateInputValue(date);
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
          const isBooked = bookedDateKeys.has(dateValue);
          const isSelected = dateValue === selectedDateValue;
          return (
            <button
              className={`package-calendar-day ${isSelected ? "selected" : ""} ${isBooked ? "booked" : ""}`}
              disabled={isPast}
              key={dateValue}
              onClick={() => {
                setSessionStart(combineDateTime(dateValue, selectedTimeValue));
                setCalendarMonth(date);
              }}
              type="button"
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <div className="package-calendar-legend">
        <span><i className="available" /> Available</span>
        <span><i className="booked" /> Booked</span>
        <span><i className="unavailable" /> Unavailable</span>
      </div>
    </section>
  );

  return (
    <MemberLayout active="Trainer Booking">
      <style>{`
        .trainer-booking-page {
          display: grid;
          gap: 28px;
          grid-template-columns: minmax(0, 1fr) 400px;
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
          gap: 10px;
          width: 100%;
        }

        .trainer-action {
          align-items: center;
          border-radius: 7px;
          cursor: pointer;
          display: inline-flex;
          font: inherit;
          font-size: 11px;
          font-weight: 900;
          height: 34px;
          justify-content: center;
          padding: 0 14px;
          text-decoration: none;
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

        .trainer-action.book-package {
          background: #ff7a00;
          border-color: #ff7a00;
          box-shadow: 0 8px 16px rgba(255, 122, 0, .22);
          color: #fff;
          min-width: 132px;
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
          display: grid;
          gap: 18px;
          margin-top: 82px;
        }

        .package-panel-card,
        .member-schedule-card {
          background: #f8f8fb;
          border-radius: 12px;
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

        .inline-schedule-panel {
          display: grid;
          gap: 14px;
          margin-top: 16px;
        }

        .member-schedule-list {
          display: grid;
          gap: 12px;
        }

        .member-schedule-item {
          background: #ffffff;
          border: 1px solid #eceef3;
          border-radius: 8px;
          display: grid;
          gap: 6px;
          padding: 13px;
        }

        .member-schedule-item strong {
          color: #0b0871;
          font-size: 13px;
          font-weight: 900;
        }

        .member-schedule-item span {
          color: #292782;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.35;
        }

        .member-schedule-status {
          align-self: start;
          background: #edf4ff;
          border-radius: 999px;
          color: #0b0871;
          display: inline-flex;
          font-size: 10px;
          font-weight: 900;
          justify-self: start;
          padding: 4px 9px;
          text-transform: uppercase;
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
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 24px 70px rgba(4, 2, 64, .25);
          color: #0b0871;
          max-width: 520px;
          padding: 0;
          overflow: hidden;
          width: 100%;
        }

        .trainer-detail-head {
          align-items: center;
          border-bottom: 1px solid #d5d7ec;
          display: flex;
          justify-content: space-between;
          min-height: 58px;
          padding: 0 26px;
        }

        .trainer-detail-head h2 {
          color: #0b0871;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 2.5px;
          margin: 0;
          text-transform: uppercase;
        }

        .trainer-detail-close {
          align-items: center;
          background: transparent;
          border: 0;
          color: #0b0871;
          cursor: pointer;
          display: inline-flex;
          height: 32px;
          justify-content: center;
          width: 32px;
        }

        .trainer-detail-close svg {
          height: 18px;
          width: 18px;
        }

        .trainer-detail-body {
          display: grid;
          gap: 26px;
          padding: 22px 32px 28px;
        }

        .trainer-profile-summary {
          align-items: center;
          background: #d6d8ec;
          border-radius: 10px;
          display: grid;
          gap: 22px;
          grid-template-columns: 96px minmax(0, 1fr);
          min-height: 136px;
          padding: 18px;
        }

        .trainer-profile-summary img {
          border-radius: 8px;
          height: 108px;
          object-fit: cover;
          width: 96px;
        }

        .trainer-profile-summary h3 {
          color: #0b0871;
          font-size: 20px;
          font-weight: 900;
          margin: 0 0 6px;
        }

        .trainer-profile-summary strong {
          color: #ff6414;
          display: block;
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .trainer-profile-meta {
          align-items: center;
          color: #0b0871;
          display: flex;
          flex-wrap: wrap;
          font-size: 12px;
          font-weight: 700;
          gap: 10px;
        }

        .trainer-profile-meta .star {
          color: #ff6414;
        }

        .trainer-detail-section h3 {
          color: #0b0871;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 2.5px;
          margin: 0 0 12px;
          text-transform: uppercase;
        }

        .trainer-detail-section p {
          color: #292782;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.32;
          margin: 0;
        }

        .trainer-expertise {
          display: grid;
          gap: 8px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .trainer-expertise span {
          align-items: center;
          background: #ffe0cf;
          border-radius: 999px;
          color: #ff6414;
          display: inline-flex;
          font-size: 11px;
          font-weight: 700;
          justify-content: center;
          min-height: 26px;
          padding: 0 12px;
          text-align: center;
        }

        .trainer-detail-actions {
          display: grid;
          gap: 10px;
          grid-template-columns: 1fr 1fr;
        }

        .trainer-detail-actions .trainer-action {
          height: 40px;
        }

        .package-schedule-backdrop {
          align-items: flex-start;
          overflow-y: auto;
        }

        .package-schedule-modal {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 24px 70px rgba(4, 2, 64, .28);
          color: #0b0871;
          margin: 18px 0;
          overflow: hidden;
          width: min(1180px, 100%);
        }

        .package-schedule-head {
          align-items: center;
          border-bottom: 1px solid #dfe1ee;
          display: flex;
          justify-content: space-between;
          min-height: 62px;
          padding: 0 26px;
        }

        .package-schedule-head h2 {
          font-size: 18px;
          font-weight: 900;
          margin: 0;
        }

        .package-schedule-body {
          background: #f7f8fc;
          display: grid;
          align-items: start;
          gap: 18px;
          grid-template-columns: minmax(0, 1fr) 320px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          padding: 24px;
        }

        .package-calendar-card,
        .package-summary-card,
        .package-schedule-list {
          background: #ffffff;
          border: 1px solid #e4e6f0;
          border-radius: 10px;
          padding: 18px;
        }

        .package-calendar-card {
          justify-self: center;
          width: min(100%, 620px);
        }

        .package-calendar-top {
          align-items: center;
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          margin-left: auto;
          margin-right: auto;
          max-width: 520px;
        }

        .package-calendar-top h3,
        .package-summary-card h3,
        .package-schedule-list h3 {
          color: #0b0871;
          font-size: 16px;
          font-weight: 900;
          margin: 0;
        }

        .package-calendar-nav {
          display: inline-flex;
          gap: 8px;
        }

        .package-calendar-nav button {
          background: #f3f4fb;
          border: 1px solid #d8dbe6;
          border-radius: 8px;
          color: #0b0871;
          cursor: pointer;
          font: inherit;
          font-size: 16px;
          font-weight: 900;
          height: 36px;
          width: 36px;
        }

        .package-calendar-week,
        .package-calendar-grid {
          display: grid;
          gap: 8px;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          margin-left: auto;
          margin-right: auto;
          max-width: 520px;
        }

        .package-calendar-week {
          color: #292782;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 9px;
          text-align: center;
        }

        .package-calendar-day,
        .package-calendar-empty {
          border-radius: 9px;
          height: 46px;
          min-height: 0;
        }

        .package-calendar-day {
          background: #dcfae7;
          border: 1px solid #24c870;
          color: #06122d;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 900;
        }

        .package-calendar-day.booked {
          background: #ffe6e8;
          border-color: #ff5365;
        }

        .package-calendar-day.selected {
          box-shadow: 0 0 0 3px #0b0871 inset;
          outline: 2px solid rgba(255, 122, 0, .22);
        }

        .package-calendar-day:disabled {
          background: #d7d9e3;
          border-color: #d7d9e3;
          color: #7c8198;
          cursor: not-allowed;
        }

        .package-calendar-legend {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-left: auto;
          margin-right: auto;
          margin-top: 15px;
          max-width: 520px;
        }

        .package-calendar-legend span {
          align-items: center;
          color: #292782;
          display: inline-flex;
          font-size: 11px;
          font-weight: 800;
          gap: 7px;
        }

        .package-calendar-legend i {
          border-radius: 999px;
          height: 9px;
          width: 9px;
        }

        .package-calendar-legend .available { background: #24c870; }
        .package-calendar-legend .booked { background: #ff5365; }
        .package-calendar-legend .unavailable { background: #818598; }

        .package-book-side {
          display: grid;
          gap: 18px;
          align-content: start;
        }

        .package-summary-card dl {
          display: grid;
          gap: 14px;
          margin: 0;
        }

        .package-summary-card dl div {
          display: grid;
          gap: 8px;
          grid-template-columns: 110px minmax(0, 1fr);
        }

        .package-summary-card dt {
          color: #6f72a6;
          font-size: 12px;
          font-weight: 900;
        }

        .package-summary-card dd {
          color: #0b0871;
          font-size: 13px;
          font-weight: 900;
          line-height: 1.35;
          margin: 0;
        }

        .package-summary-card input,
        .package-summary-card select {
          border: 1px solid #d8dbe6;
          border-radius: 9px;
          color: #0b0871;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          min-height: 46px;
          margin-top: 12px;
          padding: 0 14px;
          width: 100%;
        }

        .package-summary-card p {
          color: #6f72a6;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.35;
          margin: 12px 0 16px;
        }

        .package-book-button {
          background: #0b0871;
          border: 0;
          border-radius: 9px;
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 900;
          min-height: 46px;
          width: 100%;
        }

        .package-book-button:disabled {
          cursor: not-allowed;
          opacity: .62;
        }

        .package-schedule-main {
          display: grid;
          gap: 18px;
          grid-template-columns: minmax(420px, 1fr) minmax(270px, .72fr);
          min-width: 0;
        }

        .package-schedule-list {
          align-self: stretch;
          display: grid;
          gap: 12px;
          max-height: 440px;
          overflow-y: auto;
        }

        .package-schedule-list .session-item {
          display: grid;
          gap: 6px;
          padding: 12px;
        }

        @media (max-width: 1120px) {
          .trainer-booking-page {
            grid-template-columns: 1fr;
          }

          .package-schedule-body {
            grid-template-columns: 1fr;
            padding: 18px;
          }

          .package-schedule-main {
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

          .trainer-detail-actions,
          .trainer-expertise {
            grid-template-columns: 1fr;
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
                      “Build strength and stamina with high-intensity intervals designed for every fitness level.”
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
                      <Link className="trainer-action book-package" to={`/member/trainer-checkout?trainerId=${trainer.id}`}>Book Package</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="session-panel" id="sessions">
          <section className="package-panel-card">
            <div className="session-head">
              <h2 id="my-trainer-packages">My Trainer Packages</h2>
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
                  onClick={() => fetchPackageDetail(pkg.id, { openModal: true })}
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
          </section>

          <section className="member-schedule-card">
            <div className="session-head">
              <h2>Trainer Schedule</h2>
            </div>
            <div className="member-schedule-list">
              {scheduleLoading && <div className="trainer-status">Memuat schedule...</div>}
              {!scheduleLoading && memberScheduleItems.length === 0 && (
                <div className="trainer-status">Belum ada jadwal booking trainer.</div>
              )}
              {!scheduleLoading && memberScheduleItems.map((session) => (
                <article className="member-schedule-item" key={session.id}>
                  <strong>{formatDateTime(session.start_time)}</strong>
                  <span>{session.packageName}</span>
                  <span>Trainer: {session.trainerName || "-"}</span>
                  <span className="member-schedule-status">{session.status}</span>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>

      {isPackageModalOpen && selectedPackage && (
        <div className="trainer-detail-modal package-schedule-backdrop">
          <article className="package-schedule-modal" role="dialog" aria-modal="true">
            <div className="package-schedule-head">
              <h2>Schedule & Book Session</h2>
              <button className="trainer-detail-close" onClick={closePackageModal} type="button" aria-label="Close schedule">
                <CloseIcon />
              </button>
            </div>

            <div className="package-schedule-body">
              <div className="package-schedule-main">
                {renderScheduleCalendar()}

                <section className="package-schedule-list">
                  <h3>Schedule</h3>
                  {(selectedPackage.sessions || []).length === 0 && <div className="trainer-status">Belum ada jadwal sesi.</div>}
                  {(selectedPackage.sessions || []).map((session) => {
                    const canCancel = canMemberCancelSession(session.start_time);
                    return (
                      <article className="session-item" key={session.id}>
                        <strong>{formatDateTime(session.start_time)}</strong>
                        <span>Status: {session.status}</span>
                        <span>Booked by: {session.booked_by_name || "-"}</span>
                        {session.status === "BOOKED" && canCancel && (
                          <button
                            className="trainer-action secondary"
                            disabled={actionLoading === `cancel-${session.id}`}
                            onClick={() => cancelSession(session.id)}
                            type="button"
                          >
                            {actionLoading === `cancel-${session.id}` ? "Cancel..." : "Cancel Session"}
                          </button>
                        )}
                        {session.status === "BOOKED" && !canCancel && (
                          <span>Cancel hanya bisa sampai H-2. Hubungi admin untuk pembatalan H-1 atau hari H.</span>
                        )}
                      </article>
                    );
                  })}
                </section>
              </div>

              <aside className="package-book-side">
                <section className="package-summary-card">
                  <dl>
                    <div><dt>Package</dt><dd>{selectedPackage.catalog_name || selectedPackage.catalog_code}</dd></div>
                    <div><dt>Trainer</dt><dd>{selectedPackage.trainer_name}</dd></div>
                    <div><dt>Expired</dt><dd>{formatDateTime(selectedPackage.expires_at)}</dd></div>
                    <div><dt>Sisa Sesi</dt><dd>{selectedPackage.session_remaining}/{selectedPackage.session_total}</dd></div>
                    <div><dt>Status</dt><dd>{selectedPackage.status}</dd></div>
                  </dl>
                </section>
                <section className="package-summary-card">
                  <h3>Book Session</h3>
                  <input
                    min={toDateInputValue(new Date())}
                    onChange={(event) => setSessionStart(combineDateTime(event.target.value, selectedTimeValue))}
                    type="date"
                    value={selectedDateValue}
                  />
                  <select
                    onChange={(event) => setSessionStart(combineDateTime(selectedDateValue, event.target.value))}
                    value={selectedTimeValue}
                  >
                    {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
                  </select>
                  <p>Jam mulai sesi tersedia 06:00-18:00, termasuk sesi 18:00-19:00, interval 30 menit.</p>
                  <button
                    className="package-book-button"
                    disabled={actionLoading === "book-session" || selectedPackage.status !== "ACTIVE"}
                    onClick={bookSession}
                    type="button"
                  >
                    {actionLoading === "book-session" ? "Booking..." : "Book Session"}
                  </button>
                </section>
              </aside>
            </div>
          </article>
        </div>
      )}

      {selectedTrainer && (
        <div className="trainer-detail-modal">
          <article className="trainer-detail-card" role="dialog" aria-modal="true">
            <div className="trainer-detail-head">
              <h2>Trainer Profile</h2>
              <button className="trainer-detail-close" onClick={() => setSelectedTrainer(null)} type="button" aria-label="Close trainer profile">
                <CloseIcon />
              </button>
            </div>

            <div className="trainer-detail-body">
              <section className="trainer-profile-summary">
                <img src={selectedTrainer.image_url || gymImage} alt="" />
                <div>
                  <h3>{selectedTrainer.name}</h3>
                  <strong>{parseTrainerBio(selectedTrainer.bio).specialization}</strong>
                  <div className="trainer-profile-meta">
                    <span className="star">★ 4.7</span>
                    <span>50+ sessions</span>
                  </div>
                </div>
              </section>

              <section className="trainer-detail-section">
                <h3>About</h3>
                <p>
                  {selectedTrainer.bio ||
                    "Trainer membantu member meningkatkan endurance, strength, dan kebugaran melalui program latihan yang sesuai untuk semua level."}
                </p>
              </section>

              <section className="trainer-detail-section">
                <h3>Expertise</h3>
                <div className="trainer-expertise">
                  {getExpertiseList(selectedTrainer).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </section>

              <div className="trainer-detail-actions">
                <button className="trainer-action secondary" onClick={() => setSelectedTrainer(null)} type="button">
                  Close
                </button>
              </div>
            </div>
          </article>
        </div>
      )}
    </MemberLayout>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
