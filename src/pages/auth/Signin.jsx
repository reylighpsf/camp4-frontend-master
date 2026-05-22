import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../features/auth/authContext";

// ── Toast Component ──────────────────────────────────────────────
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
          background: #1a1a2e;
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #fca5a5;
          padding: 14px 16px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          max-width: 360px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(239,68,68,0.1);
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .toast-close {
          background: none;
          border: none;
          color: #fca5a5;
          cursor: pointer;
          padding: 2px;
          margin-left: 4px;
          opacity: 0.7;
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

// ── Signin Page ──────────────────────────────────────────────────
export default function Signin() {
  const { signin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (form.password.length < 6)
      errors.password = "Password minimal 6 karakter";
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
      await signin(form);
      navigate("/");
    } catch (err) {
      const res = err.response?.data;
      if (Array.isArray(res)) {
        setToast(res.map((e) => e.message).join(", "));
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a14;
          font-family: 'DM Sans', sans-serif;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .auth-page::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          top: -100px; right: -100px;
          pointer-events: none;
        }
        .auth-page::after {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%);
          bottom: -50px; left: -50px;
          pointer-events: none;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: rgba(15, 15, 28, 0.95);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 48px 40px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .auth-logo {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px;
          box-shadow: 0 4px 16px rgba(99,102,241,0.4);
        }

        .auth-heading {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 500;
          color: #f1f0ff;
          margin-bottom: 6px;
          letter-spacing: -0.3px;
        }

        .auth-subheading {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 36px;
          font-weight: 400;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #9ca3af;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .input-wrap {
          position: relative;
        }

        .input-wrap svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #4b5563;
          pointer-events: none;
          transition: color 0.2s;
        }

        .field input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 14px 12px 42px;
          color: #e5e7eb;
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .field input::placeholder { color: #374151; }

        .field input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .field input:focus + svg,
        .input-wrap:focus-within svg { color: #818cf8; }

        .field input.has-error {
          border-color: rgba(239,68,68,0.5);
          background: rgba(239,68,68,0.04);
        }

        .field-error {
          font-size: 12px;
          color: #f87171;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .submit-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.45);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-footer {
          text-align: center;
          margin-top: 28px;
          font-size: 13.5px;
          color: #4b5563;
        }
        .auth-footer a {
          color: #818cf8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .auth-footer a:hover { color: #a5b4fc; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .divider-text {
          font-size: 12px;
          color: #374151;
        }
      `}</style>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="auth-heading">Selamat datang</h1>
          <p className="auth-subheading">
            Masuk ke akun Anda untuk melanjutkan
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className={fieldErrors.email ? "has-error" : ""}
                  autoComplete="email"
                />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    position: "absolute",
                    pointerEvents: "none",
                    transition: "color 0.2s",
                  }}
                >
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M22 6l-10 7L2 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {fieldErrors.email && (
                <p className="field-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 8v4M12 16h.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={handleChange}
                  className={fieldErrors.password ? "has-error" : ""}
                  autoComplete="current-password"
                />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    position: "absolute",
                    pointerEvents: "none",
                    transition: "color 0.2s",
                  }}
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M7 11V7a5 5 0 0110 0v4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {fieldErrors.password && (
                <p className="field-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 8v4M12 16h.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" /> Memproses…
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <p className="auth-footer">
            Belum punya akun? <Link to="/signup">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </>
  );
}
