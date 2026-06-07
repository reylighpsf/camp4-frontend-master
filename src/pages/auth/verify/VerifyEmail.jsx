import { useLocation, useNavigate } from "react-router";
import { AuthFrame } from "../AuthFrame";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email =
    location.state?.email ||
    localStorage.getItem("vocafit-registration-email") ||
    "";

  const goToVerifySuccess = () => {
    const params = new URLSearchParams({ status: "success" });
    if (email) params.set("email", email);
    navigate(`/verify-email/result?${params.toString()}`);
  };

  return (
    <AuthFrame currentStep={2} contentClassName="verify-email-page" aside={null}>
      <style>{`
        .verify-email-page {
          align-items: center;
          display: flex;
          justify-content: center;
          min-height: calc(100vh - 84px);
          padding: 28px 16px;
        }

        .verify-email-card {
          align-items: center;
          background: #ffffff;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          max-width: 575px;
          padding: 26px 44px 24px;
          text-align: center;
          width: 100%;
        }

        .verify-email-icon {
          align-items: center;
          background: #ffd9c2;
          border-radius: 50%;
          color: #ff6414;
          display: inline-flex;
          height: 72px;
          justify-content: center;
          margin-bottom: 26px;
          width: 72px;
        }

        .verify-email-icon svg {
          height: 43px;
          width: 43px;
        }

        .verify-email-card h1 {
          color: #0b0871;
          font-size: 30px;
          font-weight: 900;
          line-height: 1.1;
          margin: 0;
        }

        .verify-email-card p {
          color: #29258f;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.3;
          margin: 18px 0 0;
          max-width: 470px;
        }

        .verify-email-target {
          background: #f6f7fb;
          border-radius: 14px;
          color: #0b0871;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.2;
          margin-top: 26px;
          padding: 15px 18px;
          width: 100%;
        }

        .verify-email-target span,
        .verify-email-target strong {
          display: block;
        }

        .verify-email-target span {
          color: #312d97;
        }

        .verify-email-target strong {
          color: #0b0871;
          font-weight: 900;
          margin-top: 2px;
          overflow-wrap: anywhere;
        }

        .verify-email-button {
          background: #ff6414;
          border: 0;
          border-radius: 11px;
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 17px;
          font-weight: 800;
          height: 49px;
          margin-top: 32px;
          width: 100%;
        }

        .verify-email-button:hover {
          background: #f45d0f;
        }

        @media (max-width: 640px) {
          .verify-email-card {
            padding: 24px 22px;
          }

          .verify-email-card h1 {
            font-size: 26px;
          }

          .verify-email-card p,
          .verify-email-button {
            font-size: 15px;
          }
        }
      `}</style>

      <section className="verify-email-card">
        <span className="verify-email-icon" aria-hidden="true">
          <MailIcon />
        </span>

        <h1>Verify Your Email</h1>
        <p>
          We've sent a verification link to your email. Please verify your email
          to continue your membership payment.
        </p>

        <div className="verify-email-target">
          <span>Email sent to:</span>
          <strong>{email || "email yang kamu daftarkan"}</strong>
        </div>

        <button className="verify-email-button" type="button" onClick={goToVerifySuccess}>
          Resend Email
        </button>
      </section>
    </AuthFrame>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M10 14h28v22H10V14Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M11 16l13 10 13-10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
