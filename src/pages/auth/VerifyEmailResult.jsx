import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import signupGym from "../../assets/auth/signup-gym.jpg";
import vocafitLogo from "../../assets/auth/vocafit-logo.png";
import { authApi } from "../../components/auth/authApi";

export default function VerifyEmailResult() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      const statusFromQuery = searchParams.get("status");
      const messageFromQuery = searchParams.get("message");
      const timeoutId = setTimeout(() => {
        if (statusFromQuery === "success") {
          setStatus("success");
        } else if (statusFromQuery === "error") {
          setStatus("error");
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
        const res = await authApi.verifyEmail(token);
        if (!isMounted) return;
        setStatus("success");
        setMessage(
          res.data?.message || "Email verified successfully. You can now login.",
        );
      } catch (err) {
        if (!isMounted) return;
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
  }, [token, searchParams]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .verify-page {
          min-height: 100vh;
          background: #0b0871;
          color: #ffe08d;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
        }

        .verify-shell {
          width: min(100%, 1040px);
          display: grid;
          grid-template-columns: 390px minmax(0, 1fr);
          align-items: center;
          gap: 64px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 224, 141, 0.28);
          border-radius: 18px;
          box-shadow: 0 22px 48px rgba(0, 0, 0, 0.24);
          padding: 32px;
          backdrop-filter: blur(8px);
        }

        .verify-panel {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .brand-mark {
          width: 112px;
          height: 100px;
          object-fit: contain;
          display: block;
          margin-bottom: 8px;
        }

        .verify-title {
          color: #ffe08d;
          font-size: 24px;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 14px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 999px;
          padding: 6px 12px;
          border: 1px solid transparent;
        }

        .status-badge.loading {
          color: #ffe08d;
          border-color: rgba(255, 224, 141, 0.45);
          background: rgba(255, 224, 141, 0.11);
        }

        .status-badge.success {
          color: #9df4bd;
          border-color: rgba(157, 244, 189, 0.45);
          background: rgba(157, 244, 189, 0.1);
        }

        .status-badge.error {
          color: #ffb68f;
          border-color: rgba(255, 122, 69, 0.45);
          background: rgba(255, 122, 69, 0.1);
        }

        .verify-message {
          color: rgba(255, 247, 214, 0.95);
          font-size: 14px;
          line-height: 1.45;
          max-width: 310px;
          margin-bottom: 24px;
        }

        .verify-message.error {
          color: #ffcfb4;
        }

        .verify-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
        }

        .btn {
          width: min(100%, 240px);
          height: 40px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
        }

        .btn-primary {
          border: 0;
          background: #ffe08d;
          color: #0b0871;
        }

        .btn-secondary {
          border: 2px solid #ffe08d;
          background: transparent;
          color: #ffe08d;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btn-primary:hover {
          box-shadow: 0 8px 20px rgba(255, 224, 141, 0.25);
        }

        .image-panel {
          width: 100%;
          height: min(74vh, 574px);
          min-height: 430px;
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }

        .image-panel img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .slider-dots {
          position: absolute;
          left: 50%;
          bottom: 14px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .slider-dots span {
          width: 17px;
          height: 3px;
          border-radius: 999px;
          background: #ffe08d;
          opacity: 0.8;
        }

        .slider-dots span:first-child {
          width: 24px;
          background: #ff7a00;
          opacity: 1;
        }

        @media (max-width: 860px) {
          .verify-shell {
            max-width: 430px;
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 24px;
          }

          .image-panel {
            order: -1;
            height: 260px;
            min-height: 260px;
          }
        }

        @media (max-width: 480px) {
          .verify-page {
            padding: 24px 18px;
            align-items: flex-start;
          }

          .verify-title {
            font-size: 22px;
          }

          .image-panel {
            height: 220px;
            min-height: 220px;
          }
        }
      `}</style>

      <main className="verify-page">
        <div className="verify-shell">
          <section className="verify-panel" aria-labelledby="verify-title">
            <img className="brand-mark" src={vocafitLogo} alt="Vocafit" />
            <h1 id="verify-title" className="verify-title">
              Email Verification
            </h1>

            {status === "loading" && (
              <span className="status-badge loading">Memverifikasi...</span>
            )}
            {status === "success" && (
              <span className="status-badge success">Berhasil</span>
            )}
            {status === "error" && (
              <span className="status-badge error">Gagal</span>
            )}

            <p className={`verify-message${status === "error" ? " error" : ""}`}>
              {status === "loading"
                ? "Mohon tunggu, kami sedang memverifikasi email kamu."
                : message}
            </p>

            <div className="verify-actions">
              <Link to="/sign-in" className="btn btn-primary">
                Lanjut ke Sign In
              </Link>
              <Link to="/sign-up" className="btn btn-secondary">
                Kembali ke Sign Up
              </Link>
            </div>
          </section>

          <section className="image-panel" aria-label="Gym preview">
            <img src={signupGym} alt="Gym equipment" />
            <div className="slider-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
