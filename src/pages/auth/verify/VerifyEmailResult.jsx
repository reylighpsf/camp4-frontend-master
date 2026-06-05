import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { AuthFrame, MembershipSummary } from "../AuthFrame";
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
  const [selectedPlanId, setSelectedPlanId] = useState(
    () => localStorage.getItem("vocafit-selected-plan") || "student",
  );

  useEffect(() => {
    if (!verificationToken) {
      const params = new URLSearchParams(queryString);
      const statusFromQuery = params.get("status");
      const messageFromQuery = params.get("message");
      const emailFromQuery = params.get("email");
      const planFromQuery = params.get("plan");

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

        if (planFromQuery) {
          localStorage.setItem("vocafit-selected-plan", planFromQuery);
          setSelectedPlanId(planFromQuery);
        }

        if (statusFromQuery === "success" || (!statusFromQuery && hasRegistrationContext)) {
          setStatus("success");
          setMessage(
            messageFromQuery ||
              "Email verified successfully. You can continue to payment.",
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
            "Email verified successfully. You can continue to payment.",
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
  const paymentPath = `/payment?plan=${selectedPlanId}`;
  const paymentState = {
    email: registrationEmail,
    notice: "Email berhasil diverifikasi. Silakan lanjutkan pembayaran membership.",
  };

  return (
    <AuthFrame
      currentStep={3}
      contentClassName="auth-centered"
      aside={<MembershipSummary actionLabel="Review Plan" />}
    >
      <h1>Email Verification</h1>
      <span className={`auth-status ${status}`}>{statusLabel}</span>

      <p className="auth-subtitle">
        {status === "loading"
          ? "Mohon tunggu, kami sedang memverifikasi email kamu."
          : message}
      </p>

      <div className="auth-actions">
        <Link
          to={status === "success" ? paymentPath : "/sign-up"}
          state={status === "success" ? paymentState : undefined}
          className="auth-secondary-btn"
        >
          {status === "success" ? "Continue To Payment" : "Back To Sign Up"}
        </Link>
        {status === "success" && (
          <Link to="/sign-up" className="auth-outline-btn">
            Back To Sign Up
          </Link>
        )}
      </div>
    </AuthFrame>
  );
}
