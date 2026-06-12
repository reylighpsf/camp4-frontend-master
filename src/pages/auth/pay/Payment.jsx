import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthFrame } from "../AuthFrame";
import {
  authMembershipPlans,
  getAuthMembershipPlan,
  getTransactionTypeFromPlanId,
  getUserTierCode,
  mapCatalogsToMembershipPlans,
} from "../membership/hooks/authPlans";
import api from "../../../components/auth/hooks/authApi";
import useTurnstile from "../sign/hooks/useTurnstile";

const paymentMethods = [
  { id: "qris", paymentMethod: "QRIS", title: "QRIS / VA Bank", subtitle: "Bayar lewat QRIS atau virtual account bank", icon: "bank" },
  { id: "cash", paymentMethod: "CASH", title: "Cash", subtitle: "Bayar langsung ke staff gym", icon: "cash" },
];

const parsePrice = (price) => Number(String(price).replace(/[^\d]/g, "")) || 0;

const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const formatCountdown = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0 || hours > 0) {
    return `${days > 0 ? `${days}d ` : ""}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const getPaymentDurationText = (paymentMethod) =>
  paymentMethod === "CASH" ? "1 hari" : "30 menit";

const getInitialRemainingMs = (paymentMethod) =>
  paymentMethod === "CASH" ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000;

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getTransactionPayload = (responseData) => {
  const data = responseData?.data || responseData || {};
  const transaction = data.transaction || data;
  return {
    transaction,
    paymentUrl: data.paymentUrl || data.payment_url || transaction?.payment_url,
  };
};

const getWaitingPaymentStorageKey = (planId) => `vocafit-waiting-payment-${planId || "default"}`;

const openPaymentInNewTab = (paymentUrl) => {
  window.open(paymentUrl, "_blank", "noopener,noreferrer");
};

const buildWaitingPayment = ({ paymentMethod = "QRIS", paymentUrl, planId, total, transaction }) => ({
  email: transaction?.email || localStorage.getItem("vocafit-registration-email") || "",
  expireAt: transaction?.expire_at || transaction?.expireAt || "",
  paymentMethod,
  paymentUrl: paymentUrl || transaction?.payment_url || transaction?.paymentUrl || "",
  planId,
  status: transaction?.status || "PENDING",
  total: transaction?.amount || total,
  transaction,
});

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedMethodId, setSelectedMethodId] = useState("qris");
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cashPending, setCashPending] = useState(false);
  const [plans, setPlans] = useState(authMembershipPlans);
  const [waitingPayment, setWaitingPayment] = useState(null);
  const [remainingMs, setRemainingMs] = useState(getInitialRemainingMs("QRIS"));
  const {
    containerRef: turnstileRef,
    error: turnstileError,
    reset: resetTurnstile,
    token: turnstileToken,
  } = useTurnstile();
  const planId =
    searchParams.get("plan") ||
    localStorage.getItem("vocafit-selected-plan") ||
    "student";
  const selectedPlan =
    plans.find((plan) => plan.id === planId) ||
    getAuthMembershipPlan(planId);
  const selectedMethod =
    paymentMethods.find((method) => method.id === selectedMethodId) ||
    paymentMethods[0];
  const total = parsePrice(selectedPlan.price);
  const waitingPaymentStorageKey = getWaitingPaymentStorageKey(selectedPlan.id);

  useEffect(() => {
    let isMounted = true;

    const fetchCatalogPlans = async () => {
      try {
        const [catalogResponse, profileResponse] = await Promise.all([
          api.get("/catalogs/membership"),
          api.get("/users/me").catch(() => null),
        ]);
        const nextProfile = profileResponse?.data?.data || null;
        if (isMounted) {
          setPlans(mapCatalogsToMembershipPlans(catalogResponse.data?.data || [], getUserTierCode(nextProfile)));
        }
      } catch {
        if (isMounted) setPlans(authMembershipPlans);
      }
    };

    fetchCatalogPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const savedWaitingPayment = JSON.parse(sessionStorage.getItem(waitingPaymentStorageKey) || "null");
        if (!savedWaitingPayment?.paymentUrl) return;

        const expireTime = savedWaitingPayment.expireAt ? new Date(savedWaitingPayment.expireAt).getTime() : 0;
        if (expireTime && expireTime <= Date.now()) {
          sessionStorage.removeItem(waitingPaymentStorageKey);
          return;
        }

        setWaitingPayment(savedWaitingPayment);
      } catch {
        sessionStorage.removeItem(waitingPaymentStorageKey);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [waitingPaymentStorageKey]);

  useEffect(() => {
    if (!waitingPayment?.expireAt) return undefined;

    const updateRemaining = () => {
      setRemainingMs(new Date(waitingPayment.expireAt).getTime() - Date.now());
    };

    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(intervalId);
  }, [waitingPayment?.expireAt]);

  useEffect(() => {
    if (!waitingPayment || remainingMs > 0) return undefined;

    const timeoutId = window.setTimeout(() => {
      sessionStorage.removeItem(waitingPaymentStorageKey);
      navigate("/payment/success?status=expire", {
        replace: true,
        state: {
          accountType:
            waitingPayment.transaction?.tier_name ||
            waitingPayment.transaction?.account_tier_code ||
            "",
          amount: waitingPayment.transaction?.amount || total,
          expiredAt: waitingPayment.expireAt,
          paymentMethod: waitingPayment.paymentMethod,
          paymentStatus: "expire",
          planId: selectedPlan.id,
          total: waitingPayment.transaction?.amount || total,
          transactionId: waitingPayment.transaction?.order_id || waitingPayment.transaction?.id,
        },
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, remainingMs, selectedPlan.id, total, waitingPayment, waitingPaymentStorageKey]);

  const goToPaymentSuccess = ({ transaction, status }) => {
    navigate("/payment/success", {
      replace: true,
      state: {
        activeDate: new Date().toISOString(),
        activeUntil: transaction?.end_date || transaction?.membership_end_date,
        paymentMethod: selectedMethod.paymentMethod,
        paymentStatus: status || transaction?.status || "PENDING",
        planId: selectedPlan.id,
        transactionId: transaction?.id,
      },
    });
  };

  const handlePay = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    setCashPending(false);

    if (!turnstileToken) {
      setError(turnstileError || "Selesaikan verifikasi captcha terlebih dahulu.");
      return;
    }

    try {
      const response = await api.post("/transactions/create", {
        transactionType: selectedPlan.catalogCode || getTransactionTypeFromPlanId(selectedPlan.id),
        paymentMethod: selectedMethod.paymentMethod,
      }, {
        headers: { "X-Turnstile-Token": turnstileToken },
      });
      const { transaction, paymentUrl } = getTransactionPayload(response.data);

      if (selectedMethod.paymentMethod === "QRIS") {
        if (paymentUrl) {
          const nextWaitingPayment = buildWaitingPayment({
            paymentMethod: "QRIS",
            paymentUrl,
            planId: selectedPlan.id,
            total: transaction?.amount || total,
            transaction,
          });
          sessionStorage.setItem(waitingPaymentStorageKey, JSON.stringify(nextWaitingPayment));
          setWaitingPayment(nextWaitingPayment);
          setMessage("");
          return;
        }

        setError("Link pembayaran Midtrans tidak tersedia.");
        return;
      }

      goToPaymentSuccess({ transaction, status: transaction?.status || "PENDING" });
    } catch (err) {
      const status = err.response?.status;
      const nextError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Gagal membuat transaksi pembayaran.";

      if (status === 401 || status === 403 || nextError === "User not found") {
        setError(
          "Transaksi belum dibuat karena session pembayaran belum aktif. Pastikan backend sudah direstart dan buka halaman ini dari link verifikasi email terbaru.",
        );
        return;
      }

      const activeOrder = err.response?.data?.data;
      if (nextError === "You already have an active order" && activeOrder) {
        const restoredPaymentUrl = activeOrder.paymentUrl || activeOrder.payment_url;
        if (!restoredPaymentUrl) {
          setError("Order aktif ditemukan, tetapi link pembayaran tidak tersedia.");
          return;
        }

        const nextWaitingPayment = buildWaitingPayment({
          paymentMethod: activeOrder.payment_method || selectedMethod.paymentMethod,
          paymentUrl: restoredPaymentUrl,
          planId: selectedPlan.id,
          total: activeOrder.amount || total,
          transaction: activeOrder,
        });
        sessionStorage.setItem(waitingPaymentStorageKey, JSON.stringify(nextWaitingPayment));
        setWaitingPayment(nextWaitingPayment);
        setMessage("Order pembayaran aktif ditemukan. Lanjutkan pembayaran dari order yang sama.");
        setError("");
        return;
      }

      setError(nextError);
    } finally {
      resetTurnstile();
      setLoading(false);
    }
  };

  const openPaymentLink = () => {
    if (!waitingPayment?.paymentUrl) return;
    openPaymentInNewTab(waitingPayment.paymentUrl);
  };

  const createNewPayment = () => {
    sessionStorage.removeItem(waitingPaymentStorageKey);
    setWaitingPayment(null);
    setRemainingMs(getInitialRemainingMs(selectedMethod.paymentMethod));
    setMessage("");
    setError("");
    setCashPending(false);
  };

  const cancelPayment = async () => {
    const transactionId = waitingPayment?.transaction?.id;
    if (!transactionId) {
      setError("Transaction ID tidak tersedia untuk cancel payment.");
      return;
    }

    setCancelLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post(`/transactions/${transactionId}/cancel`);
      sessionStorage.removeItem(waitingPaymentStorageKey);
      setWaitingPayment(null);
      setRemainingMs(getInitialRemainingMs(waitingPayment.paymentMethod));
      setMessage("Payment berhasil dibatalkan. Kamu bisa membuat payment baru.");
    } catch (err) {
      const status = err.response?.status;
      const cancelError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Gagal membatalkan payment.";

      if (status === 404 || cancelError === "Transaction not found") {
        sessionStorage.removeItem(waitingPaymentStorageKey);
        setWaitingPayment(null);
        setRemainingMs(getInitialRemainingMs(waitingPayment.paymentMethod));
        setMessage("Payment lama sudah tidak ditemukan di backend. Silakan buat payment baru.");
        return;
      }

      setError(cancelError);
    } finally {
      setCancelLoading(false);
    }
  };

  if (waitingPayment) {
    const transaction = waitingPayment.transaction || {};
    const transactionId = transaction.order_id || transaction.id || "-";
    const userEmail = waitingPayment.email || transaction.email || localStorage.getItem("vocafit-registration-email") || "-";
    const transactionTotal = Number(transaction.amount || total || 0);
    const penalty = Number(transaction.penalty_amount || 0);
    const basePrice = Math.max(0, transactionTotal - penalty);

    return (
      <AuthFrame currentStep={4} aside={null} contentClassName="payment-waiting-shell">
        <style>{paymentStyles}</style>
        <section className="payment-waiting-card" aria-labelledby="payment-waiting-title">
          <span className="payment-waiting-icon" aria-hidden="true">
            <ClockIcon />
          </span>
          <h1 id="payment-waiting-title">Waiting for Payment</h1>
          <p className="payment-waiting-subtitle">
            Your membership will be activated after the payment is confirmed.
          </p>

          <div className="payment-timer-box">
            <strong>Payment Method: {waitingPayment.paymentMethod}</strong>
            <span>Expires in {getPaymentDurationText(waitingPayment.paymentMethod)}</span>
            <b>{formatCountdown(remainingMs)}</b>
            <small>remaining</small>
          </div>

          <div className="payment-waiting-summary">
            <h2>Order Summary</h2>
            <dl>
              <div><dt>Transaction ID:</dt><dd>{transactionId}</dd></div>
              <div><dt>Status:</dt><dd>{waitingPayment.status || transaction.status || "PENDING"}</dd></div>
              <div><dt>Expired At:</dt><dd>{formatDateTime(waitingPayment.expireAt || transaction.expire_at)}</dd></div>
              <div><dt>User Email:</dt><dd>{userEmail}</dd></div>
              <div><dt>Membership:</dt><dd>{selectedPlan.name}</dd></div>
              <div><dt>Account Type:</dt><dd>{transaction.tier_name || transaction.account_tier_code || "-"}</dd></div>
              <div><dt>Price:</dt><dd className="orange">{formatCurrency(basePrice || total)}</dd></div>
              <div><dt>Payment URL:</dt><dd className="payment-url">{waitingPayment.paymentUrl}</dd></div>
            </dl>
            <div className="payment-waiting-total">
              <span>Total Payment:</span>
              <strong>{formatCurrency(transactionTotal || total)}</strong>
            </div>
          </div>

          <button className="payment-open-link" onClick={openPaymentLink} type="button">
            Open Payment Link
          </button>
          <button
            className="payment-cancel-link"
            disabled={cancelLoading}
            onClick={cancelPayment}
            type="button"
          >
            {cancelLoading ? "Cancelling..." : "Cancel Payment"}
          </button>
          <button className="payment-new-link" onClick={createNewPayment} type="button">
            Back To Payment Form
          </button>
        </section>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame currentStep={4} aside={<PaymentSummary plan={selectedPlan} total={total} />}>
      <style>{paymentStyles}</style>
      <section className="payment-card" aria-labelledby="payment-title">
        <h1 id="payment-title">Complete Your Membership Payment</h1>
        <p className="payment-subtitle">
          Finish your payment to activate your Vocafit membership and receive
          access to your member QR code.
        </p>

        <h2>Select Payment Method</h2>
        {error && <p className="payment-alert error">{error}</p>}
        {message && <p className="payment-alert success">{message}</p>}

        <div className="payment-methods">
          {paymentMethods.map((method) => (
            <button
              className={`payment-method ${method.id === selectedMethodId ? "is-active" : ""}`}
              disabled={cashPending}
              key={method.id}
              onClick={() => {
                setSelectedMethodId(method.id);
                setMessage("");
                setError("");
              }}
              type="button"
            >
              <span className="payment-method-icon" aria-hidden="true">
                {method.icon === "bank" ? <BankIcon /> : <CashIcon />}
              </span>
              <span className="payment-method-copy">
                <strong>{method.title}</strong>
                <small>{method.subtitle}</small>
              </span>
              <span className="payment-method-check" aria-hidden="true">
              </span>
            </button>
          ))}
        </div>

        <p className="payment-amount">
          Amount to pay: <strong>{formatCurrency(total)}</strong>
          <small>
            Complete payment within {getPaymentDurationText(selectedMethod.paymentMethod)}
          </small>
        </p>

        <p className="payment-note">
          Your membership will be activated after the payment is successfully
          confirmed.
        </p>

        <div className="payment-turnstile">
          <div ref={turnstileRef} />
          {turnstileError && <span>{turnstileError}</span>}
        </div>

        <div className="payment-actions">
          <Link className="payment-back" to={cashPending ? "/member" : "/choose-plan"}>
            {cashPending ? "Continue To Member Dashboard" : "Back To Choose Plan"}
          </Link>
          <button className="payment-submit" disabled={loading || cashPending} onClick={handlePay} type="button">
            {cashPending ? "Waiting Confirmation" : loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </section>
    </AuthFrame>
  );
}

function PaymentSummary({ plan, total }) {
  return (
    <aside className="payment-summary" aria-label="Order Summary">
      <h2>Order Summary</h2>
      <dl>
        <div>
          <dt>Membership Plan</dt>
          <dd>{plan.name}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>1 {plan.period}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>{formatCurrency(total)}</dd>
        </div>
        <div>
          <dt>Admin Fee</dt>
          <dd>Rp 0</dd>
        </div>
      </dl>
      <div className="payment-summary-total">
        <span>Total Payment</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
    </aside>
  );
}

function BankIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16M3 21h18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3 4 7h16l-8-4Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.9" />
      <path d="M6.5 9.5v.01M17.5 14.5v.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" />
      <path d="M24 13v12l8 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const paymentStyles = `
  .auth-checkout-shell {
    grid-template-columns: minmax(0, 690px) 330px;
  }

  .auth-checkout-shell.payment-waiting-shell {
    grid-template-columns: minmax(0, 620px);
    justify-content: center;
  }

  .auth-card {
    padding: 0;
    background: transparent;
    box-shadow: none;
  }

  .payment-card,
  .payment-summary {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 0 rgba(23, 18, 103, 0.04);
  }

  .payment-card {
    padding: 30px 40px 20px;
  }

  .payment-card h1 {
    margin: 0 0 8px;
    color: #171267;
    font-size: 24px;
    font-weight: 900;
  }

  .payment-subtitle {
    max-width: 540px;
    margin: 0 0 28px;
    color: #384076;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.35;
  }

  .payment-card h2,
  .payment-summary h2 {
    margin: 0 0 16px;
    color: #171267;
    font-size: 15px;
    font-weight: 900;
  }

  .payment-methods {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 22px;
  }

  .payment-alert {
    margin: 0 0 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.35;
    padding: 12px 14px;
  }

  .payment-alert.error {
    background: #fff0e9;
    color: #d84b17;
  }

  .payment-alert.success {
    background: #ecfff5;
    color: #0f9b55;
  }

  .payment-method {
    min-height: 92px;
    position: relative;
    border: 1px solid #d9dcef;
    border-radius: 8px;
    background: #f8f9fd;
    color: #171267;
    cursor: pointer;
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr) 24px;
    align-items: center;
    gap: 14px;
    padding: 16px;
    text-align: left;
    transition: border-color .18s ease, box-shadow .18s ease, background .18s ease, transform .18s ease;
  }

  .payment-method.is-active,
  .payment-method:hover {
    background: #fff;
    border-color: #ff6b20;
    box-shadow: 0 12px 24px rgba(23, 18, 103, 0.12);
  }

  .payment-method:hover {
    transform: translateY(-1px);
  }

  .payment-method:disabled {
    cursor: not-allowed;
    opacity: .72;
  }

  .payment-method-icon {
    width: 46px;
    height: 46px;
    border-radius: 8px;
    background: #171267;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }

  .payment-method.is-active .payment-method-icon {
    background: #ff6b20;
  }

  .payment-method-copy {
    min-width: 0;
  }

  .payment-method strong,
  .payment-method small {
    display: block;
  }

  .payment-method strong {
    font-size: 14px;
    font-weight: 900;
    line-height: 1.2;
    margin-bottom: 4px;
  }

  .payment-method small {
    color: #5d6594;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.3;
  }

  .payment-method-check {
    width: 24px;
    height: 24px;
    border: 1px solid #cfd3e6;
    border-radius: 50%;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 900;
  }

  .payment-method.is-active .payment-method-check {
    background: #ff6b20;
    border-color: #ff6b20;
  }

  .payment-method.is-active .payment-method-check::after {
    width: 8px;
    height: 5px;
    border-bottom: 2px solid #fff;
    border-left: 2px solid #fff;
    content: "";
    transform: rotate(-45deg) translate(1px, -1px);
  }

  .payment-amount {
    margin: 0 0 18px;
    border: 1px solid #e5e7f2;
    border-radius: 8px;
    background: #f8f9fd;
    color: #171267;
    font-size: 13px;
    font-weight: 900;
    padding: 14px;
    text-align: center;
  }

  .payment-amount strong {
    color: #171267;
  }

  .payment-amount small {
    display: block;
    color: #ff6b20;
    font-size: 11px;
    font-weight: 800;
    margin-top: 4px;
  }

  .payment-note {
    margin: 0 0 22px;
    border: 1px solid #8d91c5;
    border-radius: 8px;
    background: #e8e9f8;
    color: #384076;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.35;
    padding: 13px 15px;
    text-align: center;
  }

  .payment-turnstile {
    display: grid;
    justify-items: center;
    margin: 0;
    min-height: 0;
    width: 100%;
  }

  .payment-turnstile span {
    color: #d84b17;
    font-size: 12px;
    font-weight: 800;
    margin-top: 6px;
    text-align: center;
  }

  .payment-actions {
    display: grid;
    gap: 28px;
    grid-template-columns: 1fr 1fr;
  }

  .payment-back,
  .payment-submit {
    min-height: 46px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    text-decoration: none;
  }

  .payment-back {
    border: 1px solid #8d91c5;
    background: #fff;
    color: #171267;
  }

  .payment-submit {
    border: 0;
    background: #ff6b20;
    color: #fff;
    cursor: pointer;
  }

  .payment-submit:disabled {
    cursor: not-allowed;
    opacity: .68;
  }

  .payment-summary {
    padding: 30px 28px;
  }

  .payment-summary dl {
    display: grid;
    gap: 10px;
    margin: 0 0 18px;
    padding: 0 0 18px;
    border-bottom: 1px solid #9da0ce;
  }

  .payment-summary dl div,
  .payment-summary-total {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 18px;
    align-items: start;
  }

  .payment-summary dt,
  .payment-summary dd,
  .payment-summary-total span,
  .payment-summary-total strong {
    color: #171267;
    font-size: 12px;
    font-weight: 900;
  }

  .payment-summary dd {
    margin: 0;
    max-width: 120px;
    text-align: right;
  }

  .payment-summary-total strong {
    color: #ff6b20;
    font-size: 15px;
  }

  .payment-waiting-card {
    align-items: center;
    background: #ffffff;
    border-radius: 10px;
    color: #171267;
    display: flex;
    flex-direction: column;
    padding: 36px 34px 34px;
    text-align: center;
    width: 100%;
  }

  .payment-waiting-icon {
    align-items: center;
    background: #fff1c9;
    border-radius: 50%;
    box-shadow: 0 0 22px rgba(240, 194, 70, .58);
    color: #e4bf4e;
    display: inline-flex;
    height: 58px;
    justify-content: center;
    margin-bottom: 22px;
    width: 58px;
  }

  .payment-waiting-icon svg {
    height: 42px;
    width: 42px;
  }

  .payment-waiting-card h1 {
    color: #171267;
    font-size: 28px;
    font-weight: 900;
    line-height: 1.1;
    margin: 0;
  }

  .payment-waiting-subtitle {
    color: #384076;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.25;
    margin: 10px 0 20px;
    max-width: 430px;
  }

  .payment-timer-box {
    background: #ffd9c0;
    border: 1px solid #ff8b3d;
    border-radius: 10px;
    color: #171267;
    display: grid;
    gap: 6px;
    margin-bottom: 14px;
    padding: 18px;
    width: 100%;
  }

  .payment-timer-box strong,
  .payment-timer-box span,
  .payment-timer-box small {
    font-size: 13px;
    font-weight: 800;
  }

  .payment-timer-box b {
    color: #171267;
    font-size: 28px;
    line-height: 1;
  }

  .payment-waiting-summary {
    background: #f4f5fb;
    border-radius: 10px;
    margin-top: 0;
    padding: 18px 20px;
    text-align: left;
    width: 100%;
  }

  .payment-waiting-summary h2 {
    color: #171267;
    font-size: 17px;
    font-weight: 900;
    margin: 0 0 16px;
  }

  .payment-waiting-summary dl {
    border-bottom: 1px solid #d6d8e6;
    display: grid;
    gap: 10px;
    margin: 0 0 14px;
    padding-bottom: 12px;
  }

  .payment-waiting-summary dl div,
  .payment-waiting-total {
    display: grid;
    gap: 18px;
    grid-template-columns: 1fr auto;
  }

  .payment-waiting-summary dt,
  .payment-waiting-summary dd,
  .payment-waiting-total span,
  .payment-waiting-total strong {
    color: #384076;
    font-size: 13px;
    font-weight: 800;
  }

  .payment-waiting-summary dd {
    color: #171267;
    margin: 0;
    max-width: 260px;
    overflow-wrap: anywhere;
    text-align: right;
  }

  .payment-waiting-summary dd.payment-url {
    max-width: 300px;
  }

  .payment-waiting-summary dd.orange,
  .payment-waiting-total strong {
    color: #ff6b20;
  }

  .payment-open-link {
    background: #ff6b20;
    border: 0;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    font: inherit;
    font-size: 14px;
    font-weight: 900;
    height: 48px;
    margin-top: 14px;
    width: 100%;
  }

  .payment-new-link {
    background: #ffffff;
    border: 1px solid #171267;
    border-radius: 10px;
    color: #171267;
    cursor: pointer;
    font: inherit;
    font-size: 14px;
    font-weight: 900;
    height: 48px;
    margin-top: 10px;
    width: 100%;
  }

  .payment-cancel-link {
    background: #fff1f0;
    border: 1px solid #d23b2a;
    border-radius: 10px;
    color: #c73822;
    cursor: pointer;
    font: inherit;
    font-size: 14px;
    font-weight: 900;
    height: 48px;
    margin-top: 10px;
    width: 100%;
  }

  .payment-cancel-link:disabled {
    cursor: not-allowed;
    opacity: .65;
  }

  @media (max-width: 940px) {
    .auth-checkout-shell {
      grid-template-columns: 1fr;
    }

    .payment-methods,
    .payment-actions {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }

  @media (max-width: 560px) {
    .payment-card {
      padding: 24px 20px;
    }

    .payment-card h1 {
      font-size: 21px;
    }

    .payment-method {
      grid-template-columns: 42px minmax(0, 1fr) 24px;
      min-height: 86px;
      padding: 14px;
    }

    .payment-method-icon {
      height: 42px;
      width: 42px;
    }
  }
`;
