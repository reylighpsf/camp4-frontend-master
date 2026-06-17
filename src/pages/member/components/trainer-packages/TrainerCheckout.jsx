import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import MemberLayout from "@/components/member/MemberLayout";
import api from "@/components/auth/hooks/authApi";
import { requestTurnstileToken } from "@/components/auth/hooks/turnstileToken";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { getCatalogPrice, getUserTierCode } from "../../../auth/membership/hooks/authPlans";
import useTurnstile from "../../../auth/sign/hooks/useTurnstile";

const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const parseTrainerBio = (bio = "") => {
  const specialization = bio.match(/Spesialis:\s*(.+)/i)?.[1]?.trim() || bio || "HIIT Cardio";
  return { specialization };
};

const openPaymentInNewTab = (paymentUrl) => {
  window.open(paymentUrl, "_blank", "noopener,noreferrer");
};

const openBlankPaymentTab = () => {
  const paymentTab = window.open("", "_blank");
  if (paymentTab) {
    paymentTab.opener = null;
    paymentTab.document.title = "Opening Midtrans...";
    paymentTab.document.body.innerHTML =
      "<p style=\"font-family:Arial,sans-serif;padding:24px;\">Opening Midtrans payment...</p>";
  }
  return paymentTab;
};

const getTransactionPayload = (responseData) => {
  const data = responseData?.data || responseData || {};
  const transaction = data.transaction || data;
  const paymentUrl =
    data.paymentUrl ||
    data.payment_url ||
    data.redirect_url ||
    data.snap_redirect_url ||
    data.midtrans_redirect_url ||
    transaction?.paymentUrl ||
    transaction?.payment_url ||
    transaction?.redirect_url ||
    transaction?.snap_redirect_url ||
    transaction?.midtrans_redirect_url ||
    "";

  return { paymentUrl, transaction };
};

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );

const toDateInputValue = (date) => {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getDateKey = (value) => toDateInputValue(new Date(value));
const monthLabel = (date) => new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);

const getCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDate = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDate.getDay() }, () => null);
  const days = Array.from({ length: totalDays }, (_, index) => new Date(year, month, index + 1));
  return [...blanks, ...days];
};

const getBookingStartValue = (booking) => booking?.start_time || booking?.startTime || booking?.date || "";
const isBookingForTrainer = (booking, trainerId) =>
  !trainerId || booking?.trainer?.id === trainerId || booking?.trainer_id === trainerId;

const paymentMethods = [
  { id: "qris", value: "QRIS", label: "QRIS" },
  { id: "cash", value: "CASH", label: "Cash" },
];

export default function TrainerCheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTrainerId = searchParams.get("trainerId") || "";
  const initialCatalogCode = searchParams.get("catalog") || "";
  const [catalogs, setCatalogs] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [selectedCatalogCode, setSelectedCatalogCode] = useState(initialCatalogCode);
  const [selectedTrainerId, setSelectedTrainerId] = useState(initialTrainerId);
  const [participantText, setParticipantText] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [trainerBookings, setTrainerBookings] = useState([]);
  const [bookingError, setBookingError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const {
    containerRef: turnstileRef,
    error: turnstileError,
    reset: resetTurnstile,
    token: turnstileToken,
  } = useTurnstile();

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [catalogResponse, trainerResponse] = await Promise.all([
          api.get("/catalogs/trainer"),
          api.get("/trainers"),
        ]);
        if (!mounted) return;
        const trainerCatalogs = (catalogResponse.data?.data || [])
          .filter((catalog) => catalog.family === "PERSONAL_TRAINER" && catalog.is_active !== false)
          .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
        setCatalogs(trainerCatalogs);
        setTrainers(trainerResponse.data?.data || []);
        setSelectedCatalogCode((current) => current || trainerCatalogs[0]?.code || "");
      } catch (err) {
        if (mounted) setError(getErrorMessage(err, "Gagal memuat checkout trainer."));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchTrainerBookings = async () => {
      setTrainerBookings([]);
      setBookingError("");
      if (!selectedTrainerId || !isUuid(selectedTrainerId)) return;

      try {
        const firstResponse = await api.get("/trainers/sessions/my", {
          params: { page: 1, limit: 100 },
        });
        if (!mounted) return;
        const firstPage = firstResponse.data?.data || [];
        const totalPages = Number(firstResponse.data?.meta?.total_pages || 1);
        const pageResponses = totalPages > 1
          ? await Promise.all(
              Array.from({ length: totalPages - 1 }, (_, index) =>
                api.get("/trainers/sessions/my", {
                  params: { page: index + 2, limit: 100 },
                }),
              ),
            )
          : [];
        if (!mounted) return;
        setTrainerBookings([
          ...firstPage,
          ...pageResponses.flatMap((response) => response.data?.data || []),
        ].filter((booking) => isBookingForTrainer(booking, selectedTrainerId)));
      } catch {
        if (mounted) setBookingError("Data booking trainer belum tersedia.");
      }
    };

    fetchTrainerBookings();
    return () => {
      mounted = false;
    };
  }, [selectedTrainerId]);

  const selectedCatalog = useMemo(
    () => catalogs.find((catalog) => catalog.code === selectedCatalogCode),
    [catalogs, selectedCatalogCode],
  );
  const selectedTrainer = useMemo(
    () => trainers.find((trainer) => trainer.id === selectedTrainerId),
    [trainers, selectedTrainerId],
  );
  const requiredParticipants = Math.max(Number(selectedCatalog?.group_size || 1) - 1, 0);
  const userTierCode = getUserTierCode(user);
  const participantEmails = participantText
    .split(/[\n,]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);
  const bookedDateKeys = useMemo(() => {
    return new Set(
      trainerBookings
        .filter((booking) => ["BOOKED", "PENDING"].includes(String(booking.status || "").toUpperCase()))
        .map(getBookingStartValue)
        .filter(Boolean)
        .map(getDateKey),
    );
  }, [trainerBookings]);

  const submitPayment = async () => {
    setError("");
    if (!selectedCatalogCode) {
      setError("Pilih package trainer dulu.");
      return;
    }
    if (!selectedTrainerId || !isUuid(selectedTrainerId)) {
      setError("Pilih trainer dulu.");
      return;
    }
    if (participantEmails.length !== requiredParticipants) {
      setError(`Package ini membutuhkan ${requiredParticipants} email peserta tambahan.`);
      return;
    }
    const paymentTab = paymentMethod === "QRIS" ? openBlankPaymentTab() : null;
    setSubmitting(true);
    try {
      const nextTurnstileToken = turnstileToken || await requestTurnstileToken();
      if (!nextTurnstileToken) {
        setError(turnstileError || "Selesaikan verifikasi captcha terlebih dahulu.");
        paymentTab?.close();
        return;
      }

      const response = await api.post("/transactions/create", {
        paymentMethod,
        transactionType: selectedCatalogCode,
        trainerId: selectedTrainerId,
        participantEmails,
      }, {
        headers: { "X-Turnstile-Token": nextTurnstileToken },
      });
      const { paymentUrl, transaction } = getTransactionPayload(response.data);
      if (paymentMethod === "QRIS" && paymentUrl) {
        if (paymentTab) {
          paymentTab.location.assign(paymentUrl);
        } else {
          openPaymentInNewTab(paymentUrl);
        }
        return;
      }
      if (paymentMethod === "QRIS" && !paymentUrl) {
        if (paymentTab) {
          paymentTab.document.body.innerHTML =
            "<p style=\"font-family:Arial,sans-serif;padding:24px;\">Link pembayaran Midtrans tidak tersedia. Silakan kembali ke VocaFit.</p>";
        }
        setError("Link pembayaran Midtrans tidak tersedia.");
        return;
      }
      paymentTab?.close();
      navigate("/member/trainer-packages", {
        state: { notice: `Transaksi ${transaction?.status || "PENDING"} dibuat. Package muncul setelah pembayaran sukses.` },
      });
    } catch (err) {
      paymentTab?.close();
      setError(getErrorMessage(err, "Gagal membuat transaksi trainer."));
    } finally {
      resetTurnstile();
      setSubmitting(false);
    }
  };

  return (
    <MemberLayout active="Trainer Packages">
      <style>{styles}</style>
      <section className="trainer-package-page">
        <header className="tp-head">
          <div>
            <h1>Trainer Checkout</h1>
            <p>Pilih package, trainer, dan metode pembayaran.</p>
          </div>
          <Link className="tp-link" to="/member/trainer-packages">My Packages</Link>
        </header>

        {error && <p className="tp-alert error">{error}</p>}
        {loading ? (
          <div className="tp-panel">Memuat checkout...</div>
        ) : (
          <section className="tp-checkout-card">
            <div className="tp-trainer-strip">
              <img src={selectedTrainer?.image_url || selectedTrainer?.imageUrl || "https://i.pravatar.cc/80?img=47"} alt="" />
              <div>
                <strong>{selectedTrainer?.name || "Trainer"}</strong>
                <span>{parseTrainerBio(selectedTrainer?.bio).specialization}</span>
              </div>
            </div>

            <section className="tp-package-panel">
              <div className="tp-cards">
                {catalogs.map((catalog) => (
                  <button
                    className={`tp-card ${catalog.code === selectedCatalogCode ? "active" : ""}`}
                    key={catalog.code}
                    onClick={() => setSelectedCatalogCode(catalog.code)}
                    type="button"
                  >
                    <strong>{catalog.name}</strong>
                    <span>{catalog.session_count || "-"} sessions / {catalog.group_size || 1} person</span>
                    <b>{formatCurrency(getCatalogPrice(catalog, userTierCode))}</b>
                  </button>
                ))}
              </div>
            </section>

            <div className="tp-grid">
              <section className="tp-panel tp-calendar-card">
                <h2 className="tp-calendar-title">Calendar Schedules Trainer</h2>
                <div className="tp-calendar-top">
                  <h3>{monthLabel(calendarMonth)}</h3>
                  <div className="tp-calendar-nav">
                    <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} type="button">‹</button>
                    <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} type="button">›</button>
                  </div>
                </div>
                <div className="tp-calendar-week">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
                </div>
                <div className="tp-calendar-grid">
                  {calendarDays.map((date, index) => {
                    if (!date) return <span className="tp-calendar-empty" key={`empty-${index}`} />;
                    const dateValue = toDateInputValue(date);
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                    const isBooked = bookedDateKeys.has(dateValue);
                    const isSelected = selectedDate === dateValue;
                    return (
                      <button
                        className={`tp-calendar-day ${isSelected ? "selected" : ""} ${isBooked ? "booked" : ""}`}
                        disabled={isPast}
                        key={dateValue}
                        onClick={() => {
                          setSelectedDate(dateValue);
                          setCalendarMonth(date);
                        }}
                        type="button"
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
                <div className="tp-calendar-legend">
                  <span><i className="available" /> Available</span>
                  <span><i className="booked" /> Booked</span>
                  <span><i className="unavailable" /> Past date</span>
                </div>
                {bookingError && <p className="tp-calendar-note">{bookingError}</p>}
              </section>

              <section className="tp-panel tp-payment-panel">
                <h2>Trainer & Payment</h2>
              <label className="tp-field">
                Trainer
                <select value={selectedTrainerId} onChange={(event) => setSelectedTrainerId(event.target.value)}>
                  <option value="">Pilih trainer</option>
                  {trainers.map((trainer) => (
                    <option disabled={!isUuid(trainer.id)} key={trainer.id} value={trainer.id}>
                      {trainer.name}{!isUuid(trainer.id) ? " (ID tidak valid)" : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="tp-field">
                Additional participant emails
                <textarea
                  disabled={requiredParticipants === 0}
                  onChange={(event) => setParticipantText(event.target.value)}
                  placeholder={requiredParticipants ? `Isi ${requiredParticipants} email, pisahkan koma/baris` : "No additional participants needed"}
                  value={participantText}
                />
              </label>

              <div className="tp-methods">
                {paymentMethods.map((method) => (
                  <button
                    className={paymentMethod === method.value ? "active" : ""}
                    key={method.id}
                    onClick={() => setPaymentMethod(method.value)}
                    type="button"
                  >
                    {method.label}
                  </button>
                ))}
              </div>

              <div className="tp-summary">
                <span>Package</span><strong>{selectedCatalog?.name || "-"}</strong>
                <span>Trainer</span><strong>{selectedTrainer?.name || "-"}</strong>
                <span>Total</span><strong>{formatCurrency(getCatalogPrice(selectedCatalog, userTierCode))}</strong>
              </div>

              <div className="tp-turnstile">
                <div ref={turnstileRef} />
                {turnstileError && <span>{turnstileError}</span>}
              </div>

              <button className="tp-primary" disabled={submitting} onClick={submitPayment} type="button">
                {submitting ? "Membuat transaksi..." : "Buat Transaksi Trainer"}
              </button>
              </section>
            </div>
          </section>
        )}
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
  .tp-link, .tp-primary {
    background: #ff7415;
    border: 0;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    font: inherit;
    font-weight: 900;
    min-height: 42px;
    padding: 0 16px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  .tp-checkout-card {
    background: #ffffff;
    border-radius: 10px;
    max-width: 1220px;
    overflow: hidden;
  }
  .tp-trainer-strip {
    align-items: center;
    border-bottom: 1px solid #bfc3df;
    display: flex;
    gap: 10px;
    min-height: 58px;
    padding: 12px 18px;
  }
  .tp-trainer-strip img {
    border-radius: 50%;
    height: 34px;
    object-fit: cover;
    width: 34px;
  }
  .tp-trainer-strip strong {
    color: #0b0871;
    display: block;
    font-size: 12px;
    font-weight: 900;
    line-height: 1.1;
  }
  .tp-trainer-strip span {
    color: #ff5f1f;
    display: block;
    font-size: 10px;
    font-weight: 900;
    margin-top: 2px;
  }
  .tp-grid {
    display: grid;
    gap: 18px;
    grid-template-columns: 560px 340px;
    align-items: start;
    padding: 0 18px 22px;
  }
  .tp-left {
    display: grid;
    gap: 14px;
  }
  .tp-panel {
    background: #f8f8fb;
    border-radius: 10px;
    padding: 16px 18px;
  }
  .tp-panel h2 {
    font-size: 16px;
    margin: 0 0 12px;
  }
  .tp-package-panel {
    background: transparent;
    padding: 26px 18px 22px;
    max-width: 1160px;
  }
  .tp-cards {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 550px));
  }
  .tp-card {
    background: #d8daea;
    border: 1px solid transparent;
    border-radius: 8px;
    color: #0b0871;
    cursor: pointer;
    display: grid;
    gap: 4px;
    min-height: 92px;
    padding: 12px 14px;
    text-align: left;
  }
  .tp-card.active {
    border-color: #ff7415;
    background: #f8f8fb;
    box-shadow: none;
  }
  .tp-card strong {
    font-size: 17px;
    line-height: 1.15;
  }
  .tp-card b {
    font-size: 19px;
    line-height: 1.1;
  }
  .tp-card span {
    color: #ff5f1f;
    font-size: 11px;
    font-weight: 800;
  }
  .tp-calendar-card {
    background: #fff;
    border: 0;
    max-width: none;
    padding: 10px 0 0;
  }
  .tp-calendar-title {
    color: #0b0871;
    font-size: 17px;
    font-weight: 900;
    margin: 0 0 14px;
  }
  .tp-calendar-top {
    align-items: center;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    padding: 0;
    width: 560px;
    max-width: 100%;
  }
  .tp-calendar-top h2 {
    font-size: 16px;
    margin: 0;
  }
  .tp-calendar-top h3 {
    font-size: 16px;
    margin: 0;
  }
  .tp-calendar-nav {
    display: flex;
    gap: 8px;
  }
  .tp-calendar-nav button {
    background: #f3f4fb;
    border: 1px solid #d8dbe6;
    border-radius: 8px;
    color: #0b0871;
    cursor: pointer;
    font: inherit;
    font-size: 17px;
    font-weight: 900;
    height: 32px;
    line-height: 1;
    width: 32px;
  }
  .tp-calendar-week,
  .tp-calendar-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(7, 62px);
    justify-content: start;
    width: 560px;
    max-width: 100%;
  }
  .tp-calendar-week {
    color: #0b0871;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 8px;
    text-align: center;
  }
  .tp-calendar-day,
  .tp-calendar-empty {
    height: 56px;
    min-height: 0;
    width: 62px;
  }
  .tp-payment-panel {
    background: #f8f8fb;
    margin-top: 10px;
    padding: 24px 18px 18px;
    justify-self: center;
    width: min(100%, 430px);
  }
  .tp-calendar-day {
    background: #d9f9e5;
    border: 1px solid #22c55e;
    border-radius: 8px;
    color: #0b0871;
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
  }
  .tp-calendar-day.booked {
    background: #ffe7ea;
    border-color: #ff5365;
  }
  .tp-calendar-day.selected {
    box-shadow: 0 0 0 3px #0b0871 inset;
  }
  .tp-calendar-day:disabled {
    background: #d8dae3;
    border-color: #d8dae3;
    color: #737892;
    cursor: not-allowed;
  }
  .tp-calendar-legend {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }
  .tp-calendar-legend span {
    align-items: center;
    color: #0b0871;
    display: inline-flex;
    font-size: 10px;
    font-weight: 800;
    gap: 7px;
  }
  .tp-calendar-legend i {
    border-radius: 50%;
    display: inline-block;
    height: 8px;
    width: 8px;
  }
  .tp-calendar-legend .available { background: #24c870; }
  .tp-calendar-legend .booked { background: #ff5365; }
  .tp-calendar-legend .unavailable { background: #818598; }
  .tp-calendar-note {
    color: #c73822;
    font-size: 11px;
    font-weight: 900;
    margin: 16px 0 0;
  }
  .tp-field {
    display: grid;
    gap: 8px;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 10px;
    text-transform: uppercase;
  }
  .tp-field select, .tp-field textarea {
    border: 1px solid #d8dbe6;
    border-radius: 8px;
    font: inherit;
    min-height: 40px;
    padding: 8px 10px;
    text-transform: none;
  }
  .tp-field textarea {
    min-height: 74px;
    resize: vertical;
  }
  .tp-methods {
    display: grid;
    gap: 8px;
    grid-template-columns: 1fr 1fr;
    margin: 12px 0;
  }
  .tp-methods button {
    background: #fff;
    border: 1px solid #0b0871;
    border-radius: 8px;
    color: #0b0871;
    cursor: pointer;
    font: inherit;
    font-weight: 900;
    font-size: 13px;
    min-height: 38px;
  }
  .tp-methods .active {
    background: #0b0871;
    color: #fff;
  }
  .tp-summary {
    border-top: 1px solid #d8dbe6;
    display: grid;
    gap: 8px;
    gap: 6px;
    grid-template-columns: 82px 1fr;
    padding-top: 12px;
  }
  .tp-turnstile {
    display: grid;
    justify-items: center;
    margin-top: 0;
    min-height: 0;
    width: 100%;
  }
  .tp-turnstile span {
    color: #c73822;
    font-size: 12px;
    font-weight: 800;
    margin-top: 6px;
    text-align: center;
  }
  .tp-summary span {
    color: #5f6296;
    font-size: 13px;
    font-weight: 900;
  }
  .tp-summary strong {
    color: #0b0871;
    font-size: 13px;
    font-weight: 900;
  }
  .tp-primary {
    justify-content: center;
    margin-top: 14px;
    min-height: 42px;
    font-size: 14px;
    width: 100%;
  }
  .tp-primary:disabled {
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
  @media (max-width: 1180px) {
    .tp-grid {
      grid-template-columns: 1fr;
      padding: 0 18px 22px;
    }

    .tp-checkout-card,
    .tp-package-panel {
      max-width: none;
    }

    .tp-head {
      align-items: stretch;
      flex-direction: column;
    }
  }
  @media (max-width: 720px) {
    .tp-cards {
      grid-template-columns: 1fr;
    }

    .tp-calendar-card {
      padding: 8px 0 0;
    }

    .tp-calendar-week,
    .tp-calendar-grid {
      gap: 7px;
      grid-template-columns: repeat(7, minmax(32px, 1fr));
      width: 100%;
    }

    .tp-calendar-day,
    .tp-calendar-empty {
      height: 40px;
      width: 100%;
    }

    .tp-summary {
      grid-template-columns: 1fr;
    }
  }
`;
