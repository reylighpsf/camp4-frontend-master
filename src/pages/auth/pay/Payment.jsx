import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthFrame } from "../AuthFrame";
import { getAuthMembershipPlan } from "../membership/hooks/authPlans";
import api from "../../../components/auth/authApi";

const paymentMethods = [
  { id: "qris", paymentMethod: "QRIS", title: "QRIS", subtitle: "Scan QR to pay" },
  { id: "cash", paymentMethod: "CASH", title: "Cash", subtitle: "Pay to gym staff" },
];

const parsePrice = (price) => Number(String(price).replace(/[^\d]/g, "")) || 0;

const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const getTransactionType = (planId) =>
  planId === "daily" ? "MEMBERSHIP_DAILY" : "MEMBERSHIP_MONTHLY";

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedMethodId, setSelectedMethodId] = useState("qris");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cashPending, setCashPending] = useState(false);
  const planId =
    searchParams.get("plan") ||
    localStorage.getItem("vocafit-selected-plan") ||
    "student";
  const selectedPlan = getAuthMembershipPlan(planId);
  const selectedMethod =
    paymentMethods.find((method) => method.id === selectedMethodId) ||
    paymentMethods[0];
  const total = parsePrice(selectedPlan.price);

  const handlePay = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    setCashPending(false);

    try {
      await api.post("/transactions/create", {
        transactionType: getTransactionType(selectedPlan.id),
        paymentMethod: selectedMethod.paymentMethod,
      });

      if (selectedMethod.paymentMethod === "QRIS") {
        navigate("/member", {
          state: {
            notice: "Pembayaran QRIS berhasil dibuat. Selamat datang di dashboard member.",
          },
        });
        return;
      }

      setCashPending(true);
      setMessage(
        "Status pembayaran: menunggu konfirmasi pembayaran dari admin.",
      );
    } catch (err) {
      const status = err.response?.status;
      const nextError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Gagal membuat transaksi pembayaran.";

      if (status === 401 || status === 403 || nextError === "User not found") {
        navigate("/sign-in", {
          state: {
            notice:
              "Silakan sign in terlebih dahulu untuk melanjutkan pembayaran membership.",
            returnTo: `/payment?plan=${selectedPlan.id}`,
          },
        });
        return;
      }

      setError(nextError);
    } finally {
      setLoading(false);
    }
  };

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
                <QrIcon />
              </span>
              <span>
                <strong>{method.title}</strong>
                <small>{method.subtitle}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="payment-qr-box" aria-label="QR payment preview">
          <QrIcon />
          <span>QR Code will appear here</span>
        </div>

        <p className="payment-amount">
          Amount to pay: <strong>{formatCurrency(total)}</strong>
          <small>Complete payment within 15 minutes</small>
        </p>

        <p className="payment-note">
          Your membership will be activated after the payment is successfully
          confirmed.
        </p>

        <div className="payment-actions">
          <Link className="payment-back" to={cashPending ? "/member" : "/sign-up"}>
            {cashPending ? "Continue To Member Dashboard" : "Back To Registration"}
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

function QrIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 9h2v2H9zM13 9h2v2h-2zM9 13h2v2H9zM14 14h1v1h-1z" fill="currentColor" />
    </svg>
  );
}

const paymentStyles = `
  .auth-checkout-shell {
    grid-template-columns: minmax(0, 690px) 330px;
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
    gap: 12px 32px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 26px;
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
    min-height: 54px;
    border: 1px solid #9da0ce;
    border-radius: 8px;
    background: #fff;
    color: #171267;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    text-align: left;
  }

  .payment-method.is-active,
  .payment-method:hover {
    border-color: #171267;
    box-shadow: 0 8px 18px rgba(23, 18, 103, 0.1);
  }

  .payment-method:disabled {
    cursor: not-allowed;
    opacity: .72;
  }

  .payment-method-icon {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: #171267;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }

  .payment-method strong,
  .payment-method small {
    display: block;
  }

  .payment-method strong {
    font-size: 12px;
    font-weight: 900;
  }

  .payment-method small {
    color: #171267;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
  }

  .payment-qr-box {
    width: 190px;
    height: 190px;
    margin: 0 auto 18px;
    border: 1px solid #c9cad8;
    border-radius: 5px;
    color: #b8b8b8;
    display: grid;
    gap: 12px;
    align-content: center;
    justify-items: center;
  }

  .payment-qr-box svg {
    width: 64px;
    height: 64px;
  }

  .payment-qr-box span {
    color: #aaa;
    font-size: 10px;
    font-weight: 800;
  }

  .payment-amount {
    margin: 0 0 18px;
    color: #171267;
    font-size: 12px;
    font-weight: 900;
    text-align: center;
  }

  .payment-amount strong {
    color: #171267;
  }

  .payment-amount small {
    display: block;
    color: #ff6b20;
    font-size: 10px;
    font-weight: 700;
    margin-top: 2px;
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

    .payment-qr-box {
      width: 160px;
      height: 160px;
    }
  }
`;
