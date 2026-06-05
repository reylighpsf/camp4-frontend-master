import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../../components/auth/useAuth";
import signupGym from "../../../assets/auth/signup-gym.jpg";
import vocafitLogo from "../../../assets/auth/vocafit-logo.png";

const isAdminRole = (role) => role === "pengurus" || role === "admin";

function Toast({ message, onClose }) {
  useEffect(() => {
    const timeoutId = setTimeout(onClose, 4000);
    return () => clearTimeout(timeoutId);
  }, [onClose]);

  return (
    <div className="signin-toast">
      <span>{message}</span>
      <button className="signin-toast-close" onClick={onClose} type="button" aria-label="Tutup">
        x
      </button>
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
    if (!notice) return undefined;

    const timeoutId = setTimeout(() => {
      setToast(notice);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) errors.email = "Email tidak valid";
    if (form.password.length < 6) errors.password = "Password minimal 6 karakter";

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldErrors({});
    setToast("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const user = await signin(form);
      const returnTo = location.state?.returnTo;
      navigate(
        returnTo && !isAdminRole(user?.role)
          ? returnTo
          : isAdminRole(user?.role)
            ? "/admin"
            : "/member",
      );
    } catch (err) {
      const res = err.response?.data;
      if (Array.isArray(res)) {
        setToast(res.map((item) => item.message).join(", "));
      } else {
        setToast(res?.error || res?.message || "Login gagal. Coba beberapa saat lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{signinStyles}</style>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <main className="signin-page">
        <section className="signin-shell" aria-labelledby="signin-title">
          <div className="signin-panel">
            <img className="signin-logo" src={vocafitLogo} alt="Vocafit" />
            <h1 id="signin-title">Sign In</h1>

            <form className="signin-form" onSubmit={handleSubmit} noValidate>
              <label className="signin-field" htmlFor="email">
                <span>Email</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={fieldErrors.email ? "has-error" : ""}
                  placeholder="johndoe@gmail.com"
                  autoComplete="email"
                />
                {fieldErrors.email && <small>{fieldErrors.email}</small>}
              </label>

              <label className="signin-field" htmlFor="password">
                <span>Password</span>
                <div className="signin-password">
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
                    className="signin-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    <EyeIcon hidden={showPassword} />
                  </button>
                </div>
                {fieldErrors.password && <small>{fieldErrors.password}</small>}
              </label>

              <Link className="signin-forgot" to="/forgot-password">
                Forgot password?
              </Link>

              <button className="signin-submit" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="signin-spinner" /> Loading
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="signin-footer">
              New to Vocafit? <Link to="/choose-plan">Join Us</Link>
            </p>
          </div>

          <aside className="signin-visual" aria-label="Gym preview">
            <img src={signupGym} alt="Gym equipment" />
            <div className="signin-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}

function EyeIcon({ hidden }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {hidden ? (
        <>
          <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 8.8 3.1 10 8a11.8 11.8 0 0 1-3.1 5.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.6 6.6A11.8 11.8 0 0 0 2 12c1.2 4.9 5 8 10 8 1.2 0 2.4-.2 3.4-.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

const signinStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }

  .signin-page {
    min-height: 100vh;
    background: #080173;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    display: grid;
    place-items: center;
    padding: 28px;
  }

  .signin-shell {
    width: min(100%, 1040px);
    min-height: 620px;
    background: rgba(255, 255, 255, .04);
    border: 1px solid rgba(255, 220, 123, .22);
    border-radius: 12px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, .18);
    backdrop-filter: blur(4px);
    display: grid;
    grid-template-columns: minmax(300px, .86fr) minmax(360px, 1.14fr);
    gap: 56px;
    overflow: hidden;
    padding: 36px 44px;
  }

  .signin-panel {
    width: min(100%, 360px);
    align-self: center;
    justify-self: center;
    display: grid;
    justify-items: center;
  }

  .signin-logo {
    width: 72px;
    height: auto;
    display: block;
    margin-bottom: 12px;
  }

  .signin-panel h1 {
    margin: 0 0 34px;
    color: #ffdc7b;
    font-size: 22px;
    font-weight: 900;
    line-height: 1;
  }

  .signin-form {
    width: 100%;
  }

  .signin-field {
    display: grid;
    gap: 6px;
    margin-bottom: 11px;
  }

  .signin-field span {
    color: #fff;
    font-size: 13px;
    font-weight: 600;
  }

  .signin-field input {
    width: 100%;
    height: 38px;
    border: 2px solid #ffdc7b;
    border-radius: 8px;
    background: transparent;
    color: #fff;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    outline: none;
    padding: 0 13px;
  }

  .signin-field input::placeholder {
    color: rgba(255, 255, 255, .8);
  }

  .signin-field input:focus {
    border-color: #fff;
    box-shadow: 0 0 0 3px rgba(255, 220, 123, .2);
  }

  .signin-field input.has-error {
    border-color: #ff6b20;
    box-shadow: 0 0 0 3px rgba(255, 107, 32, .18);
  }

  .signin-field small {
    min-height: 15px;
    color: #ffb18a;
    font-size: 11px;
    font-weight: 800;
  }

  .signin-password {
    position: relative;
  }

  .signin-password input {
    padding-right: 42px;
  }

  .signin-password-toggle {
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #fff;
    cursor: pointer;
    position: absolute;
    right: 3px;
    top: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .signin-password-toggle:hover,
  .signin-password-toggle:focus-visible {
    color: #ffdc7b;
    outline: none;
  }

  .signin-forgot {
    color: #ff6b20;
    display: inline-flex;
    font-size: 13px;
    font-weight: 900;
    margin-top: 2px;
    text-decoration: none;
  }

  .signin-submit {
    width: 142px;
    min-height: 42px;
    border: 0;
    border-radius: 999px;
    background: #ffdc7b;
    color: #080173;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    margin: 24px auto 0;
  }

  .signin-submit:hover:not(:disabled) {
    box-shadow: 0 10px 24px rgba(255, 220, 123, .25);
    transform: translateY(-1px);
  }

  .signin-submit:disabled {
    cursor: not-allowed;
    opacity: .68;
  }

  .signin-footer {
    margin: 30px 0 0;
    color: #fff;
    font-size: 13px;
    font-weight: 800;
    text-align: center;
  }

  .signin-footer a {
    color: #ff6b20;
    text-decoration: none;
  }

  .signin-visual {
    min-height: 540px;
    position: relative;
    align-self: stretch;
    border-radius: 2px;
    overflow: hidden;
  }

  .signin-visual img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
  }

  .signin-dots {
    position: absolute;
    left: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    display: inline-flex;
    gap: 7px;
  }

  .signin-dots span {
    width: 18px;
    height: 3px;
    border-radius: 999px;
    background: rgba(255, 220, 123, .62);
  }

  .signin-dots span:first-child {
    width: 28px;
    background: #ff6b20;
  }

  .signin-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(8, 1, 115, .25);
    border-top-color: #080173;
    border-radius: 50%;
    animation: signin-spin .7s linear infinite;
  }

  .signin-toast {
    position: fixed;
    right: 24px;
    top: 24px;
    z-index: 9999;
    max-width: 360px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: #171267;
    color: #fff;
    border-radius: 8px;
    padding: 13px 15px;
    font: 800 13px 'DM Sans', sans-serif;
    box-shadow: 0 12px 30px rgba(23, 18, 103, .25);
  }

  .signin-toast-close {
    border: 0;
    background: transparent;
    color: #fff;
    cursor: pointer;
    font: inherit;
  }

  @keyframes signin-spin { to { transform: rotate(360deg); } }

  @media (max-width: 880px) {
    .signin-shell {
      grid-template-columns: 1fr;
      gap: 28px;
      min-height: 0;
      padding: 28px;
    }

    .signin-visual {
      min-height: 280px;
      order: -1;
    }
  }

  @media (max-width: 520px) {
    .signin-page {
      padding: 18px;
    }

    .signin-shell {
      padding: 22px;
    }

    .signin-panel {
      width: 100%;
    }

    .signin-panel h1 {
      font-size: 20px;
      margin-bottom: 26px;
    }
  }
`;
