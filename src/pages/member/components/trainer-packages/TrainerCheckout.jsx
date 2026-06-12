import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import MemberLayout from "../../../../components/member/MemberLayout";
import api from "../../../../components/auth/hooks/authApi";
import { useAuth } from "../../../../components/auth/hooks/useAuth";
import { getCatalogPrice, getUserTierCode } from "../../../auth/membership/hooks/authPlans";
import useTurnstile from "../../../auth/sign/hooks/useTurnstile";

const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

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
    if (!turnstileToken) {
      setError(turnstileError || "Selesaikan verifikasi captcha terlebih dahulu.");
      return;
    }

    const paymentTab = paymentMethod === "QRIS" ? openBlankPaymentTab() : null;
    setSubmitting(true);
    try {
      const response = await api.post("/transactions/create", {
        paymentMethod,
        transactionType: selectedCatalogCode,
        trainerId: selectedTrainerId,
        participantEmails,
      }, {
        headers: { "X-Turnstile-Token": turnstileToken },
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
          <div className="tp-grid">
            <section className="tp-panel">
              <h2>Package Trainer</h2>
              <div className="tp-cards">
                {catalogs.map((catalog) => (
                  <button
                    className={`tp-card ${catalog.code === selectedCatalogCode ? "active" : ""}`}
                    key={catalog.code}
                    onClick={() => setSelectedCatalogCode(catalog.code)}
                    type="button"
                  >
                    <strong>{catalog.name}</strong>
                    <span>{catalog.session_count || "-"} sesi / {catalog.group_size || 1} orang</span>
                    <b>{formatCurrency(getCatalogPrice(catalog, userTierCode))}</b>
                  </button>
                ))}
              </div>
            </section>

            <section className="tp-panel">
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
                Email peserta tambahan
                <textarea
                  disabled={requiredParticipants === 0}
                  onChange={(event) => setParticipantText(event.target.value)}
                  placeholder={requiredParticipants ? `Isi ${requiredParticipants} email, pisahkan koma/baris` : "Tidak perlu peserta tambahan"}
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
  .tp-grid {
    display: grid;
    gap: 22px;
    grid-template-columns: minmax(0, 1fr) 390px;
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
  .tp-cards {
    display: grid;
    gap: 12px;
  }
  .tp-card {
    background: #fff;
    border: 1px solid #eceef3;
    border-radius: 8px;
    color: #0b0871;
    cursor: pointer;
    display: grid;
    gap: 6px;
    padding: 16px;
    text-align: left;
  }
  .tp-card.active {
    border-color: #ff7415;
    box-shadow: 0 0 0 2px rgba(255,116,21,.16);
  }
  .tp-card strong, .tp-card b { font-size: 16px; }
  .tp-card span {
    color: #5f6296;
    font-weight: 800;
  }
  .tp-field {
    display: grid;
    gap: 8px;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 14px;
    text-transform: uppercase;
  }
  .tp-field select, .tp-field textarea {
    border: 1px solid #d8dbe6;
    border-radius: 8px;
    font: inherit;
    min-height: 44px;
    padding: 10px;
    text-transform: none;
  }
  .tp-field textarea {
    min-height: 92px;
    resize: vertical;
  }
  .tp-methods {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 1fr;
    margin: 16px 0;
  }
  .tp-methods button {
    background: #fff;
    border: 1px solid #0b0871;
    border-radius: 8px;
    color: #0b0871;
    cursor: pointer;
    font: inherit;
    font-weight: 900;
    min-height: 40px;
  }
  .tp-methods .active {
    background: #0b0871;
    color: #fff;
  }
  .tp-summary {
    border-top: 1px solid #d8dbe6;
    display: grid;
    gap: 8px;
    grid-template-columns: 100px 1fr;
    padding-top: 14px;
  }
  .tp-turnstile {
    display: grid;
    justify-items: center;
    margin-top: 16px;
    min-height: 8px;
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
    font-weight: 800;
  }
  .tp-primary {
    justify-content: center;
    margin-top: 18px;
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
  @media (max-width: 980px) {
    .tp-grid {
      grid-template-columns: 1fr;
    }

    .tp-head {
      align-items: stretch;
      flex-direction: column;
    }
  }
`;
