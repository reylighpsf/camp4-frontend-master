import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { AuthFrame } from "../AuthFrame";
import { authApi } from "../../../components/auth/hooks/authApi";

const verificationRequests = new Map();

const getVerificationRequest = (token) => {
  if (!verificationRequests.has(token)) {
    verificationRequests.set(token, authApi.verifyEmail(token));
  }

  return verificationRequests.get(token);
};

export default function VerifyEmailResult() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const tokenFromQuery = searchParams.get("token");
  const verificationToken = token || tokenFromQuery;
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [registrationEmail, setRegistrationEmail] = useState(
    () => localStorage.getItem("vocafit-registration-email") || "",
  );

  useEffect(() => {
    if (!verificationToken) {
      const params = new URLSearchParams(queryString);
      const statusFromQuery = params.get("status");
      const messageFromQuery = params.get("message");
      const emailFromQuery = params.get("email");

      const timeoutId = setTimeout(() => {
        const savedEmail =
          emailFromQuery || 
          localStorage.getItem("vocafit-registration-email") ||
          "";
        const hasRegistrationContext = Boolean(savedEmail || localStorage.getItem("vocafit-selected-plan"));

        if (emailFromQuery) {
          localStorage.setItem("vocafit-registration-email", emailFromQuery);
          setRegistrationEmail(emailFromQuery);
        } else if (savedEmail) {
          setRegistrationEmail(savedEmail);
        }

        if (statusFromQuery === "success" || (!statusFromQuery && hasRegistrationContext)) {
          setStatus("success");
          setMessage(
            messageFromQuery ||
              "Email verified successfully. You can choose a membership plan.",
          );
        } else {
          setStatus("error");
          setMessage(messageFromQuery || "Verification status is not available.");
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    let isMounted = true;

    const verify = async () => {
      setStatus("loading");
      setMessage("");

      try {
        const res = await getVerificationRequest(verificationToken);
        if (!isMounted) return;
        const verifiedEmail =
          res.data?.data?.email ||
          res.data?.email ||
          localStorage.getItem("vocafit-registration-email") ||
          "";

        setStatus("success");
        if (verifiedEmail) {
          localStorage.setItem("vocafit-registration-email", verifiedEmail);
          setRegistrationEmail(verifiedEmail);
        }
        setMessage(
          res.data?.message ||
            "Email verified successfully. You can choose a membership plan.",
        );
      } catch (err) {
        if (!isMounted) return;

        verificationRequests.delete(verificationToken);
        setStatus("error");
        setMessage(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Verification failed. Please try again.",
        );
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [verificationToken, queryString]);

  const statusLabel = {
    loading: "Memverifikasi...",
    success: "Berhasil",
    error: "Gagal",
  }[status];
  const choosePlanState = {
    email: registrationEmail,
    notice: "Email berhasil diverifikasi. Silakan pilih membership plan.",
  };
  const isExpiredMessage = /expired|kedaluwarsa|kadaluwarsa/i.test(message);
  const errorTitle = isExpiredMessage ? "Verification Link Expired" : "Email Verification Failed";
  const errorMessage = isExpiredMessage
    ? "Your verification link has expired. Please go back to sign up and request a new verification email."
    : message;

  return (
    <AuthFrame
      currentStep={4}
      contentClassName="verify-result-page"
      aside={null}
      showSteps={false}
    >
      <style>{`
        .verify-result-page {
          align-items: center;
          display: flex;
          justify-content: center;
          min-height: 100vh;
          padding: 30px 16px;
        }

        .verify-result-card {
          align-items: center;
          background: #ffffff;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          max-width: 535px;
          min-height: 530px;
          padding: 34px 36px 34px;
          text-align: center;
          width: 100%;
        }

        .verify-success-illustration {
          align-items: center;
          background: #f4f5fb;
          border-radius: 10px;
          display: inline-flex;
          height: 190px;
          justify-content: center;
          margin-bottom: 32px;
          width: 260px;
        }

        .verify-success-illustration svg {
          height: 164px;
          width: 214px;
        }

        .verify-error-illustration {
          align-items: center;
          background: #fff3f0;
          border-radius: 10px;
          display: inline-flex;
          height: 170px;
          justify-content: center;
          margin-bottom: 30px;
          width: 250px;
        }

        .verify-error-illustration svg {
          height: 138px;
          width: 180px;
        }

        .verify-result-card h1 {
          color: #0b0871;
          font-size: 25px;
          font-weight: 900;
          line-height: 1.12;
          margin: 0;
        }

        .verify-result-card p {
          color: #29258f;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.25;
          margin: 12px 0 0;
          max-width: 430px;
        }

        .verify-result-email {
          align-items: center;
          background: #f4f5fb;
          border-radius: 10px;
          color: #0b0871;
          display: inline-flex;
          gap: 16px;
          margin-top: 28px;
          min-height: 64px;
          min-width: 310px;
          padding: 12px 18px;
        }

        .verify-result-email-icon {
          align-items: center;
          background: #dedff0;
          border-radius: 50%;
          color: #0b0871;
          display: inline-flex;
          height: 32px;
          justify-content: center;
          width: 32px;
        }

        .verify-result-email-icon svg {
          height: 18px;
          width: 18px;
        }

        .verify-result-email strong {
          color: #0b0871;
          font-size: 15px;
          font-weight: 900;
          overflow-wrap: anywhere;
        }

        .verify-result-status {
          border-radius: 999px;
          display: inline-flex;
          font-size: 14px;
          font-weight: 900;
          margin-top: 28px;
          padding: 9px 14px;
        }

        .verify-result-status.loading {
          background: #f6f7fb;
          color: #29258f;
        }

        .verify-result-status.success {
          background: #ecfff5;
          color: #0f9b55;
        }

        .verify-result-status.error {
          background: #fff0e9;
          color: #d84b17;
        }

        .verify-error-box {
          background: #fff0e9;
          border: 1px solid #ffb197;
          border-radius: 10px;
          color: #d84b17;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.35;
          margin-top: 24px;
          max-width: 430px;
          padding: 14px 16px;
          width: 100%;
        }

        .verify-result-button {
          align-items: center;
          background: #ff6414;
          border: 0;
          border-radius: 10px;
          color: #ffffff;
          cursor: pointer;
          display: inline-flex;
          font: inherit;
          font-size: 15px;
          font-weight: 800;
          height: 49px;
          justify-content: center;
          margin-top: 22px;
          text-decoration: none;
          width: 100%;
        }

        .verify-result-button:hover {
          background: #f45d0f;
        }

        .verify-result-button.is-muted {
          background: #0b0871;
        }

        @media (max-width: 560px) {
          .verify-result-card {
            min-height: 380px;
            padding: 34px 22px 26px;
          }

          .verify-success-illustration {
            height: 160px;
            width: 100%;
          }

          .verify-error-illustration {
            height: 150px;
            width: 100%;
          }

          .verify-result-email {
            min-width: 0;
            width: 100%;
          }

          .verify-result-card h1 {
            font-size: 25px;
          }

          .verify-result-card p,
          .verify-result-button {
            font-size: 14px;
          }
        }
      `}</style>

      <section className="verify-result-card">
        {status === "success" && (
          <span className="verify-success-illustration" aria-hidden="true">
            <VerifySuccessIllustration />
          </span>
        )}
        {status === "error" && (
          <span className="verify-error-illustration" aria-hidden="true">
            <VerifyExpiredIllustration />
          </span>
        )}

        <h1>
          {status === "success"
            ? "Email Verified Successfully"
            : status === "error"
              ? errorTitle
              : "Email Verification"}
        </h1>

        <p>
          {status === "loading"
            ? "Mohon tunggu, kami sedang memverifikasi email kamu."
            : status === "success"
              ? "Your email has been successfully verified. You can now continue your membership payment."
              : errorMessage}
        </p>

        {status === "success" && (
          <div className="verify-result-email">
            <span className="verify-result-email-icon" aria-hidden="true">
              <MailIcon />
            </span>
            <strong>{registrationEmail || "Email berhasil diverifikasi"}</strong>
          </div>
        )}

        {status === "loading" && (
          <span className={`verify-result-status ${status}`}>{statusLabel}</span>
        )}

        {status === "error" && (
          <div className="verify-error-box">
            {message || "Verification status is not available."}
          </div>
        )}

        <Link
          to={status === "success" ? "/choose-plan" : "/sign-up"}
          state={status === "success" ? choosePlanState : undefined}
          className={`verify-result-button${status === "success" ? "" : " is-muted"}`}
        >
          {status === "success" ? "Continue to Choose Membership Plan" : "Back To Sign Up"}
        </Link>
      </section>
    </AuthFrame>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerifySuccessIllustration() {
  return (
    <svg viewBox="0 0 214 164" fill="none" aria-hidden="true">
      <circle cx="34" cy="42" r="3" fill="#9ca3ff" />
      <circle cx="178" cy="50" r="3" stroke="#9ca3ff" strokeWidth="3" />
      <path d="M170 34v12M164 40h12M58 64v10M53 69h10" stroke="#7f86f2" strokeWidth="3" strokeLinecap="round" />
      <path d="M37 108v9M32.5 112.5h9" stroke="#ff6414" strokeWidth="3" strokeLinecap="round" />
      <path d="M59 132c22 15 78 18 115-2" stroke="#d8d9ee" strokeWidth="8" strokeLinecap="round" />
      <path d="M64 83h86c6 0 11 5 11 11v45H53V94c0-6 5-11 11-11Z" fill="#6f75d8" />
      <path d="m53 94 54 35 54-35v45H53V94Z" fill="#5a61c9" />
      <path d="m53 139 45-30c5-3 12-3 17 0l46 30H53Z" fill="#737ae4" />
      <rect x="80" y="56" width="55" height="63" rx="7" fill="#ffffff" stroke="#cfd1f0" strokeWidth="4" />
      <circle cx="108" cy="75" r="18" fill="#29c76f" />
      <path d="m98 75 7 7 14-15" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M142 96c11-11 25-14 42-8l-7 19c-12-4-23-2-33 7l-2-18Z" fill="#0b0871" />
      <path d="m177 89 8 3-7 19-8-3 7-19Z" fill="#ff6414" />
      <circle cx="82" cy="119" r="4" fill="#0b0871" />
      <circle cx="153" cy="119" r="4" fill="#0b0871" />
    </svg>
  );
}

function VerifyExpiredIllustration() {
  return (
    <svg viewBox="0 0 180 138" fill="none" aria-hidden="true">
      <circle cx="35" cy="32" r="3" fill="#ff9a7b" />
      <circle cx="148" cy="45" r="4" stroke="#ff9a7b" strokeWidth="3" />
      <path d="M145 24v11M139.5 29.5h11M45 90v10M40 95h10" stroke="#ff6414" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 112c20 12 73 16 106-2" stroke="#ffd1c4" strokeWidth="8" strokeLinecap="round" />
      <path d="M52 60h72c6 0 11 5 11 11v43H41V71c0-6 5-11 11-11Z" fill="#ff9a7b" />
      <path d="m41 71 47 31 47-31v43H41V71Z" fill="#ff7a4f" />
      <path d="m41 114 39-27c5-3 12-3 17 0l38 27H41Z" fill="#ffb098" />
      <rect x="66" y="34" width="49" height="58" rx="7" fill="#ffffff" stroke="#ffd1c4" strokeWidth="4" />
      <circle cx="90" cy="54" r="17" fill="#ff263b" />
      <path d="m83 47 14 14M97 47 83 61" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
      <path d="M73 75h34M73 84h27" stroke="#ffd1c4" strokeWidth="4" strokeLinecap="round" />
      <circle cx="64" cy="105" r="4" fill="#0b0871" />
      <circle cx="116" cy="105" r="4" fill="#0b0871" />
    </svg>
  );
}
