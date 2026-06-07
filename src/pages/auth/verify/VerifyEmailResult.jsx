import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { AuthFrame } from "../AuthFrame";
import { authApi } from "../../../components/auth/authApi";

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
  const paymentState = {
    email: registrationEmail,
    notice: "Email berhasil diverifikasi. Silakan lanjutkan pembayaran membership.",
  };

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
          min-height: 420px;
          padding: 42px 36px 34px;
          text-align: center;
          width: 100%;
        }

        .verify-result-card h1 {
          color: #0b0871;
          font-size: 29px;
          font-weight: 900;
          line-height: 1.12;
          margin: 0;
        }

        .verify-result-card p {
          color: #29258f;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.25;
          margin: 14px 0 0;
          max-width: 390px;
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
          margin-top: 29px;
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
        <h1>
          {status === "success"
            ? "Complete Your Membership Payment"
            : "Email Verification"}
        </h1>

        <p>
          {status === "loading"
            ? "Mohon tunggu, kami sedang memverifikasi email kamu."
            : status === "success"
              ? "Open the payment link to complete your payment securely."
              : message}
        </p>

        {status !== "success" && (
          <span className={`verify-result-status ${status}`}>{statusLabel}</span>
        )}

        <Link
          to={status === "success" ? "/payment" : "/sign-up"}
          state={status === "success" ? paymentState : undefined}
          className={`verify-result-button${status === "success" ? "" : " is-muted"}`}
        >
          {status === "success" ? "Continue to Payment" : "Back To Sign Up"}
        </Link>
      </section>
    </AuthFrame>
  );
}
