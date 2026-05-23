import { Link, useLocation } from "react-router";
import signupGym from "../../assets/auth/signup-gym.jpg";
import vocafitLogo from "../../assets/auth/vocafit-logo.png";

export default function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email || "";

  const openInbox = () => {
    window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
  };

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

        .verify-text {
          color: rgba(255, 247, 214, 0.9);
          font-size: 14px;
          line-height: 1.45;
          max-width: 310px;
          margin-bottom: 10px;
        }

        .verify-email {
          color: #ffe08d;
          font-size: 14px;
          font-weight: 700;
          max-width: 310px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 24px;
        }

        .verify-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          margin-bottom: 18px;
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

        .verify-footnote {
          color: rgba(255, 247, 214, 0.8);
          font-size: 13px;
          line-height: 1.35;
          max-width: 300px;
        }

        .verify-footnote a {
          color: #ff7a00;
          font-weight: 700;
          text-decoration: none;
        }

        .verify-footnote a:hover {
          text-decoration: underline;
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
              Verify Your Email
            </h1>

            <p className="verify-text">
              Akun kamu berhasil dibuat. Kami sudah kirim link verifikasi ke email:
            </p>
            <p className="verify-email">{email || "email yang kamu daftarkan"}</p>

            <div className="verify-actions">
              <button type="button" className="btn btn-primary" onClick={openInbox}>
                Buka Inbox
              </button>
              <Link to="/sign-in" className="btn btn-secondary">
                Kembali ke Sign In
              </Link>
            </div>

            <p className="verify-footnote">
              Belum ada email? Cek folder spam/promosi atau{" "}
              <Link to="/sign-up">daftar ulang</Link>.
            </p>
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

