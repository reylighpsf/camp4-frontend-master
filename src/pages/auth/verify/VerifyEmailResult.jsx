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
  const choosePlanPath = "/choose-plan";
  const choosePlanState = {
    email: registrationEmail,
    notice: "Email berhasil diverifikasi. Silakan pilih membership plan.",
  };

  return (
    <AuthFrame
      currentStep={2}
      contentClassName="auth-single-page"
      aside={null}
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
          to={status === "success" ? choosePlanPath : "/sign-up"}
          state={status === "success" ? choosePlanState : undefined}
          className="auth-secondary-btn"
        >
          {status === "success" ? "Choose Member Plan" : "Back To Sign Up"}
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
