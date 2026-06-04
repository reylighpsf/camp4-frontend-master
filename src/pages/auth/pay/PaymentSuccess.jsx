import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import vocafitLogo from "../../../assets/auth/vocafit-logo.png";
import api from "../../../components/auth/authApi";
import { useAuth } from "../../../components/auth/useAuth";
import { getAuthMembershipPlan } from "../membership/hooks/authPlans";

const formatDate = (value) => {
  const date = value ? new Date(value) : new Date();

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getMemberId = (user) => {
  const rawId = user?.id || user?.member_id || user?.email || "VOC";
  return `VF${String(rawId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase()}`;
};

const formatPaymentStatus = (status) => {
  const normalizedStatus = String(status || "").toUpperCase();
  if (normalizedStatus === "SUCCESS" || normalizedStatus === "PAID") return "Paid";
  if (normalizedStatus === "FAILED") return "Failed";
  return "Pending";
};

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchMe } = useAuth();
  const paymentState = location.state || {};
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get("/users/me");
        setProfile(response.data?.data || null);
      } catch {
        setProfile(null);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const selectedPlan = useMemo(
    () => getAuthMembershipPlan(paymentState.planId || localStorage.getItem("vocafit-selected-plan") || "student"),
    [paymentState.planId],
  );

  const memberName =
    profile?.full_name ||
    profile?.name ||
    paymentState.memberName ||
    "Vocafit Member";
  const membershipId = getMemberId(profile || { email: localStorage.getItem("vocafit-registration-email") });
  const activeUntil = formatDate(
    profile?.membership_end_date ||
      profile?.membership?.end_date ||
      paymentState.endDate ||
      paymentState.activeDate,
  );
  const profileImageUrl =
    profile?.profile_image_url ||
    profile?.profileImageUrl ||
    profile?.image_url ||
    profile?.image ||
    "";
  const paymentStatus = formatPaymentStatus(paymentState.paymentStatus);

  const handleGoToDashboard = async () => {
    await fetchMe();
    navigate("/member", { replace: true });
  };

  return (
    <main className="payment-success-page">
      <style>{successStyles}</style>

      <section className="success-hero" aria-labelledby="success-title">
        <span className="success-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="m6 12 4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 id="success-title">Welcome to Vocafit</h1>
        <p>
          Your membership is now active. You can access your member dashboard,
          use your personal QR code for check-in, and start your fitness journey
          with Vocafit.
        </p>

        <article className="success-card" aria-label="Membership confirmation">
          <div className="success-brand">
            <img src={vocafitLogo} alt="Vocafit" />
            <strong>Vocafit</strong>
          </div>

          <dl className="success-details">
            <div>
              <dt>Member Name</dt>
              <dd>{memberName}</dd>
            </div>
            <div>
              <dt>Member ID</dt>
              <dd>{membershipId}</dd>
            </div>
            <div>
              <dt>Membership Plan</dt>
              <dd className="accent">{selectedPlan.name}</dd>
            </div>
            <div>
              <dt>Active Until</dt>
              <dd>{activeUntil}</dd>
            </div>
            <div>
              <dt>Status Payment</dt>
              <dd className={paymentStatus === "Paid" ? "paid" : "pending"}>{paymentStatus}</dd>
            </div>
          </dl>

          <div className="success-photo" aria-label="Member profile photo">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt={memberName} />
            ) : (
              <span>{memberName.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
        </article>

        <p className="success-note">
          Use your QR code when checking in or checking out at Vocafit Gym.
        </p>

        <button className="success-dashboard-btn" onClick={handleGoToDashboard} type="button">
          Go to Member Dashboard
        </button>
      </section>
    </main>
  );
}

const successStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  .payment-success-page {
    min-height: 100vh;
    background: #cfd1e4;
    color: #171267;
    font-family: 'DM Sans', sans-serif;
    padding: 28px 20px;
  }

  .success-hero {
    display: grid;
    justify-items: center;
    margin: 0 auto;
    max-width: 760px;
    text-align: center;
  }

  .success-check {
    align-items: center;
    background: #dffff0;
    border: 3px solid #10bd58;
    border-radius: 50%;
    box-shadow: 0 0 24px rgba(16, 189, 88, .45);
    color: #10bd58;
    display: inline-flex;
    height: 48px;
    justify-content: center;
    margin-bottom: 18px;
    width: 48px;
  }

  .success-check svg {
    height: 30px;
    width: 30px;
  }

  .success-hero h1 {
    color: #171267;
    font-size: clamp(24px, 4vw, 34px);
    font-weight: 800;
    line-height: 1.1;
    margin: 0 0 8px;
  }

  .success-hero > p {
    color: #384076;
    font-size: clamp(13px, 2vw, 16px);
    font-weight: 700;
    line-height: 1.35;
    margin: 0 0 28px;
    max-width: 560px;
  }

  .success-card {
    background: #fff;
    border-radius: 8px;
    display: grid;
    gap: 24px;
    grid-template-columns: minmax(0, 1fr);
    padding: 30px 34px;
    text-align: left;
    width: min(100%, 560px);
  }

  .success-brand {
    align-items: center;
    display: inline-flex;
    gap: 10px;
  }

  .success-brand img {
    height: 28px;
    object-fit: contain;
    width: 28px;
  }

  .success-brand strong {
    color: #ff6b20;
    font-size: 14px;
    font-weight: 900;
  }

  .success-details {
    display: grid;
    gap: 14px;
    margin: 0;
  }

  .success-details div {
    min-width: 0;
  }

  .success-details dt {
    color: #384076;
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 3px;
  }

  .success-details dd {
    color: #171267;
    font-size: 13px;
    font-weight: 900;
    margin: 0;
  }

  .success-details dd.accent {
    color: #ff6b20;
  }

  .success-details dd.paid {
    color: #10a650;
  }

  .success-details dd.pending {
    color: #ff6b20;
  }

  .success-photo {
    align-items: center;
    align-self: center;
    background: #f6f7ff;
    border: 12px solid #fff;
    box-shadow: 0 0 34px rgba(23, 18, 103, .18);
    display: flex;
    grid-column: 2;
    grid-row: 2;
    height: 150px;
    justify-content: center;
    justify-self: center;
    overflow: hidden;
    width: 150px;
  }

  .success-photo img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .success-photo span {
    color: #171267;
    font-size: 48px;
    font-weight: 900;
  }

  .success-note {
    border: 1px solid #171267;
    border-radius: 8px;
    color: #171267;
    font-size: 12px;
    font-weight: 800;
    margin: 14px 0 12px;
    min-height: 40px;
    padding: 12px 16px;
    width: min(100%, 560px);
  }

  .success-dashboard-btn {
    align-items: center;
    background: #ff6b20;
    border: 0;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    justify-content: center;
    min-height: 44px;
    text-decoration: none;
    width: min(100%, 560px);
  }

  @media (min-width: 680px) {
    .success-card {
      grid-template-columns: 1fr 190px;
      min-height: 300px;
      position: relative;
    }

    .success-brand {
      grid-column: 1 / -1;
    }

    .success-details {
      grid-column: 1;
      grid-row: 2;
    }
  }

  @media (max-width: 679px) {
    .success-photo {
      grid-column: 1;
      grid-row: auto;
      margin: 0 auto;
    }
  }
`;
