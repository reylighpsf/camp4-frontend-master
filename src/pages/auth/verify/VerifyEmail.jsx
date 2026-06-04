import { Link, useLocation } from "react-router";
import { AuthFrame, MembershipSummary } from "../AuthFrame";

export default function VerifyEmail() {
  const location = useLocation();
  const email =
    location.state?.email ||
    localStorage.getItem("vocafit-registration-email") ||
    "";

  const openInbox = () => {
    window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
  };

  return (
    <AuthFrame
      currentStep={3}
      contentClassName="auth-centered"
      aside={<MembershipSummary actionLabel="Review Plan" />}
    >
      <h1>Verify Your Email</h1>
      <p className="auth-subtitle">
        Akun kamu berhasil dibuat. Kami sudah kirim link verifikasi ke email:
      </p>

      <p className="auth-status">
        {email || "email yang kamu daftarkan"}
      </p>

      <div className="auth-actions">
        <button type="button" className="auth-secondary-btn" onClick={openInbox}>
          Open Inbox
        </button>
        <Link to="/sign-in" className="auth-outline-btn">
          Back To Sign In
        </Link>
      </div>

      <p className="auth-footer">
        Belum ada email? Cek spam/promosi atau <Link to="/sign-up">daftar ulang</Link>.
      </p>
    </AuthFrame>
  );
}
