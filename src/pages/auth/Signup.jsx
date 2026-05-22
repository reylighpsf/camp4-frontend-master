import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../features/auth/authContext";
import signupGym from "../../assets/auth/signup-gym.jpg";
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

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
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
    const phoneRegex = /^[0-9+\-\s()]{8,16}$/;

    if (form.name.trim().length < 3) errors.name = "Nama minimal 3 karakter";
    if (!phoneRegex.test(form.phoneNumber.trim())) {
      errors.phoneNumber = "Nomor telepon tidak valid";
    }
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
      await signup(form);
      navigate("/");
    } catch (err) {
      const res = err.response?.data;
      if (Array.isArray(res)) {
        setToast(res.map((e) => e.message).join(", "));
      } else if (res?.message) {
        setToast(res.message);
      } else {
        setToast("Pendaftaran gagal. Coba beberapa saat lagi.");
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

        .signup-page {
          min-height: 100vh;
          background: #0b0871;
          color: #ffe08d;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
        }

        .signup-shell {
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

        .signup-panel {
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

        .signup-title {
          color: #ffe08d;
          font-size: 24px;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 30px;
        }

        .signup-form {
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
          padding: 0 14px;
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

        .field-error {
          min-height: 16px;
          color: #ffb68f;
          font-size: 12px;
          line-height: 1.25;
          margin-top: 4px;
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
          margin: 34px auto 16px;
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
          .signup-shell {
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
          .signup-page {
            padding: 24px 18px;
            align-items: flex-start;
          }

          .signup-title {
            margin-bottom: 24px;
          }

          .image-panel {
            height: 220px;
            min-height: 220px;
          }
        }
      `}</style>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <main className="signup-page">
        <div className="signup-shell">
          <section className="signup-panel" aria-labelledby="signup-title">
            <div className="signup-panel">
              <img className="brand-mark" src={vocafitLogo} alt="Vocafit" />

              <h1 id="signup-title" className="signup-title">
                Sign Up
              </h1>

              <form className="signup-form" onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className={fieldErrors.name ? "has-error" : ""}
                    autoComplete="name"
                  />
                  {fieldErrors.name && (
                    <p className="field-error">{fieldErrors.name}</p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className={fieldErrors.phoneNumber ? "has-error" : ""}
                    autoComplete="tel"
                  />
                  {fieldErrors.phoneNumber && (
                    <p className="field-error">{fieldErrors.phoneNumber}</p>
                  )}
                </div>

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
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className={fieldErrors.password ? "has-error" : ""}
                    autoComplete="new-password"
                  />
                  {fieldErrors.password && (
                    <p className="field-error">{fieldErrors.password}</p>
                  )}
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner" /> Loading
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>

              <p className="auth-footer">
                Already have an account? <Link to="/sign-in">Sign In</Link>
              </p>
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
