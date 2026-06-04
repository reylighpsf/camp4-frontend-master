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
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      const params = new URLSearchParams(queryString);
      const statusFromQuery = params.get("status");
      const messageFromQuery = params.get("message");

      const timeoutId = setTimeout(() => {
        if (statusFromQuery === "success") {
          setStatus("success");
        } else {
          setStatus("error");
        }

        setMessage(messageFromQuery || "Verification status is not available.");
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    let isMounted = true;

    const verify = async () => {
      setStatus("loading");
      setMessage("");

      try {
        const res = await getVerificationRequest(token);
        if (!isMounted) return;

        setStatus("success");
        setMessage(
          res.data?.message || "Email verified successfully. You can now login.",
        );
      } catch (err) {
        if (!isMounted) return;

        verificationRequests.delete(token);
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
  }, [token, queryString]);

  const statusLabel = {
    loading: "Memverifikasi...",
    success: "Berhasil",
    error: "Gagal",
  }[status];
  const selectedPlanId = localStorage.getItem("vocafit-selected-plan") || "student";
  const signInState = {
    notice: "Email berhasil diverifikasi. Silakan sign in untuk melanjutkan pembayaran.",
    returnTo: `/payment?plan=${selectedPlanId}`,
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
        <Link to="/sign-in" state={signInState} className="auth-secondary-btn">
          Continue To Sign In
        </Link>
        <Link to="/sign-up" className="auth-outline-btn">
          Back To Sign Up
        </Link>
      </div>
    </AuthFrame>
  );
}
