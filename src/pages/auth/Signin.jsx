import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import { useAuth } from "../../components/auth/useAuth";
import signinGym from "../../assets/auth/signup-gym.jpg";
import vocafitLogo from "../../assets/auth/vocafit-logo.png";

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="toast">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 8v4M12 16h.01"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <span>{message}</span>
      <button onClick={onClose} className="toast-close" aria-label="Tutup">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <style>{`
        .toast {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #171267;
          border: 1px solid rgba(255, 224, 141, 0.5);
          color: #ffe08d;
          padding: 14px 16px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          max-width: 360px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toast-close {
          background: none;
          border: none;
          color: #ffe08d;
          cursor: pointer;
          padding: 2px;
          margin-left: 4px;
          opacity: 0.75;
          transition: opacity 0.15s;
          flex-shrink: 0;
        }

        .toast-close:hover { opacity: 1; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function Signin() {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const notice = location.state?.notice;
    if (!notice) return;
    const timeoutId = setTimeout(() => {
      setToast(notice);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) errors.email = "Email tidak valid";
    if (form.password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setToast("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      return setFieldErrors(errors);
    }

    setLoading(true);
    try {
      const user = await signin(form);
      navigate(user?.role === "pengurus" ? "/admin" : "/member");
    } catch (err) {
      const res = err.response?.data;
      if (Array.isArray(res)) {
        setToast(res.map((e) => e.message).join(", "));
      } else if (res?.error) {
        setToast(res.error);
      } else if (res?.message) {
        setToast(res.message);
      } else {
        setToast("Login gagal. Coba beberapa saat lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .signin-page {
          min-height: 100vh;
          background: #0b0871;
          color: #ffe08d;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
        }

        .signin-shell {
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

        .signin-panel {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .brand-mark {
          width: 112px;
          height: 100px;
          object-fit: contain;
          display: block;
          margin-bottom: 8px;
        }

        .signin-title {
          color: #ffe08d;
          font-size: 24px;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 34px;
        }

        .signin-form {
          width: 100%;
        }

        .field {
          margin-bottom: 10px;
        }

        .field label {
          display: block;
          color: #ffe08d;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.25;
          margin-bottom: 6px;
        }

        .input-wrap {
          position: relative;
        }

        .field input {
          width: 100%;
          height: 39px;
          background: transparent;
          border: 2px solid #ffe08d;
          border-radius: 10px;
          color: #fff7d6;
          font: inherit;
          font-size: 15px;
          outline: none;
          padding: 0 42px 0 14px;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .field input:focus {
          background: rgba(255, 224, 141, 0.08);
          box-shadow: 0 0 0 3px rgba(255, 224, 141, 0.16);
        }

        .field input.has-error {
          border-color: #ff7a45;
          box-shadow: 0 0 0 3px rgba(255, 122, 69, 0.14);
        }

        .password-toggle {
          width: 30px;
          height: 30px;
          border: 0;
          background: transparent;
          color: #ffe08d;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.9;
        }

        .password-toggle:hover {
          opacity: 1;
        }

        .field-error {
          min-height: 16px;
          color: #ffb68f;
          font-size: 12px;
          line-height: 1.25;
          margin-top: 4px;
        }

        .forgot-link {
          color: #ff7a00;
          display: inline-block;
          font-size: 14px;
          font-weight: 700;
          margin-top: 2px;
          text-decoration: none;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .submit-btn {
          width: 126px;
          height: 38px;
          border: 0;
          border-radius: 999px;
          background: #ffe08d;
          color: #0b0871;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
          margin: 30px auto 28px;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(255, 224, 141, 0.25);
        }

        .submit-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(11, 8, 113, 0.25);
          border-top-color: #0b0871;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-footer {
          color: #ffe08d;
          font-size: 15px;
          line-height: 1.4;
          text-align: center;
        }

        .auth-footer a {
          color: #ff7a00;
          font-weight: 700;
          text-decoration: none;
        }

        .auth-footer a:hover {
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
          .signin-shell {
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
          .signin-page {
            padding: 24px 18px;
            align-items: flex-start;
          }

          .signin-title {
            margin-bottom: 28px;
          }

          .image-panel {
            height: 220px;
            min-height: 220px;
          }
        }
      `}</style>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <main className="signin-page">
        <div className="signin-shell">
          <section className="signin-panel" aria-labelledby="signin-title">
            <img className="brand-mark" src={vocafitLogo} alt="Vocafit" />

            <h1 id="signin-title" className="signin-title">
              Sign In
            </h1>

            <form className="signin-form" onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={fieldErrors.email ? "has-error" : ""}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="field-error">{fieldErrors.email}</p>
                )}
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    className={fieldErrors.password ? "has-error" : ""}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Lihat password"
                    }
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="field-error">{fieldErrors.password}</p>
                )}
              </div>

              <a href="#forgot-password" className="forgot-link">
                Forgot password?
              </a>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner" /> Loading
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="auth-footer">
              New to Vocafit? <Link to="/sign-up">Join Us</Link>
            </p>
          </section>

          <section className="image-panel" aria-label="Gym preview">
            <img src={signinGym} alt="Gym equipment" />
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
