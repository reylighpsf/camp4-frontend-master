import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { authApi } from "../../../components/auth/authApi";
import signupGym from "../../../assets/auth/signup-gym.jpg";
import vocafitLogo from "../../../assets/auth/vocafit-logo.png";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setMessage("");
    setError("");
  };

  const validateEmail = () => {
    if (!isValidEmail(form.email.trim())) {
      setFieldErrors({ email: "Email tidak valid" });
      return false;
    }
    return true;
  };

  const requestOtp = async (mode = "request") => {
    if (!validateEmail()) return;

    setLoading(mode);
    setMessage("");
    setError("");

    try {
      const payload = { email: form.email.trim() };
      const response =
        mode === "resend"
          ? await authApi.resendForgotPassword(payload)
          : await authApi.forgotPassword(payload);

      setOtpRequested(true);
      setMessage(response.data?.message || "OTP reset password sudah dikirim ke email kamu.");
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengirim OTP reset password."));
    } finally {
      setLoading("");
    }
  };

  const validateReset = () => {
    const errors = {};

    if (!isValidEmail(form.email.trim())) errors.email = "Email tidak valid";
    if (!/^\d{6}$/.test(form.otp.trim())) errors.otp = "OTP harus 6 digit angka";
    if (form.newPassword.length < 6) errors.newPassword = "Password minimal 6 karakter";
    if (form.confirmPassword !== form.newPassword) {
      errors.confirmPassword = "Konfirmasi password tidak sama";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (!validateReset()) return;

    setLoading("reset");
    setMessage("");
    setError("");

    try {
      const response = await authApi.resetPassword({
        email: form.email.trim(),
        otp: form.otp.trim(),
        newPassword: form.newPassword,
      });

      navigate("/sign-in", {
        replace: true,
        state: {
          notice: response.data?.message || "Password berhasil direset. Silakan login.",
        },
      });
    } catch (err) {
      setError(getErrorMessage(err, "Gagal reset password."));
    } finally {
      setLoading("");
    }
  };

  return (
    <>
      <style>{forgotStyles}</style>
      <main className="forgot-page">
        <section className="forgot-shell" aria-labelledby="forgot-title">
          <div className="forgot-panel">
            <img className="forgot-logo" src={vocafitLogo} alt="Vocafit" />
            <h1 id="forgot-title">Reset Password</h1>
            <p className="forgot-copy">
              Masukkan email akun kamu, lalu gunakan OTP dari email untuk membuat password baru.
            </p>

            {message && <p className="forgot-alert success">{message}</p>}
            {error && <p className="forgot-alert error">{error}</p>}

            <form className="forgot-form" onSubmit={resetPassword} noValidate>
              <label className="forgot-field" htmlFor="email">
                <span>Email</span>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={fieldErrors.email ? "has-error" : ""}
                  placeholder="johndoe@gmail.com"
                  autoComplete="email"
                />
                {fieldErrors.email && <small>{fieldErrors.email}</small>}
              </label>

              <div className="forgot-otp-actions">
                <button
                  className="forgot-secondary"
                  disabled={Boolean(loading)}
                  onClick={() => requestOtp("request")}
                  type="button"
                >
                  {loading === "request" ? "Mengirim..." : "Kirim OTP"}
                </button>
                <button
                  className="forgot-secondary"
                  disabled={Boolean(loading) || !otpRequested}
                  onClick={() => requestOtp("resend")}
                  type="button"
                >
                  {loading === "resend" ? "Mengirim..." : "Kirim Ulang"}
                </button>
              </div>

              <label className="forgot-field" htmlFor="otp">
                <span>OTP</span>
                <input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.otp}
                  onChange={(event) => updateField("otp", event.target.value.replace(/\D/g, ""))}
                  className={fieldErrors.otp ? "has-error" : ""}
                  placeholder="6 digit OTP"
                  autoComplete="one-time-code"
                />
                {fieldErrors.otp && <small>{fieldErrors.otp}</small>}
              </label>

              <label className="forgot-field" htmlFor="newPassword">
                <span>Password Baru</span>
                <input
                  id="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={(event) => updateField("newPassword", event.target.value)}
                  className={fieldErrors.newPassword ? "has-error" : ""}
                  autoComplete="new-password"
                />
                {fieldErrors.newPassword && <small>{fieldErrors.newPassword}</small>}
              </label>

              <label className="forgot-field" htmlFor="confirmPassword">
                <span>Konfirmasi Password</span>
                <input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  className={fieldErrors.confirmPassword ? "has-error" : ""}
                  autoComplete="new-password"
                />
                {fieldErrors.confirmPassword && <small>{fieldErrors.confirmPassword}</small>}
              </label>

              <button className="forgot-submit" disabled={Boolean(loading)} type="submit">
                {loading === "reset" ? "Menyimpan..." : "Reset Password"}
              </button>
            </form>

            <p className="forgot-footer">
              Ingat password? <Link to="/sign-in">Sign In</Link>
            </p>
          </div>

          <aside className="forgot-visual" aria-label="Gym preview">
            <img src={signupGym} alt="Gym equipment" />
          </aside>
        </section>
      </main>
    </>
  );
}

const forgotStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }

  .forgot-page {
    min-height: 100vh;
    background: #080173;
    color: #fff;
    display: grid;
    font-family: 'DM Sans', sans-serif;
    place-items: center;
    padding: 28px;
  }

  .forgot-shell {
    width: min(100%, 1040px);
    min-height: 640px;
    background: rgba(255, 255, 255, .04);
    border: 1px solid rgba(255, 220, 123, .22);
    border-radius: 12px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, .18);
    display: grid;
    gap: 48px;
    grid-template-columns: minmax(320px, .9fr) minmax(360px, 1.1fr);
    overflow: hidden;
    padding: 36px 44px;
  }

  .forgot-panel {
    align-self: center;
    display: grid;
    justify-self: center;
    justify-items: center;
    width: min(100%, 390px);
  }

  .forgot-logo {
    display: block;
    height: auto;
    margin-bottom: 12px;
    width: 72px;
  }

  .forgot-panel h1 {
    color: #ffdc7b;
    font-size: 22px;
    font-weight: 900;
    line-height: 1;
    margin: 0 0 12px;
  }

  .forgot-copy {
    color: rgba(255,255,255,.84);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.4;
    margin: 0 0 20px;
    text-align: center;
  }

  .forgot-form {
    display: grid;
    gap: 11px;
    width: 100%;
  }

  .forgot-field {
    display: grid;
    gap: 6px;
  }

  .forgot-field span {
    color: #fff;
    font-size: 13px;
    font-weight: 700;
  }

  .forgot-field input {
    background: transparent;
    border: 2px solid #ffdc7b;
    border-radius: 8px;
    color: #fff;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    height: 38px;
    outline: none;
    padding: 0 13px;
    width: 100%;
  }

  .forgot-field input::placeholder {
    color: rgba(255,255,255,.75);
  }

  .forgot-field input:focus {
    border-color: #fff;
    box-shadow: 0 0 0 3px rgba(255, 220, 123, .2);
  }

  .forgot-field input.has-error {
    border-color: #ff6b20;
    box-shadow: 0 0 0 3px rgba(255, 107, 32, .18);
  }

  .forgot-field small {
    color: #ffb18a;
    font-size: 11px;
    font-weight: 800;
    min-height: 15px;
  }

  .forgot-otp-actions {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 1fr;
  }

  .forgot-secondary,
  .forgot-submit {
    align-items: center;
    border-radius: 999px;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 12px;
    font-weight: 900;
    justify-content: center;
    min-height: 40px;
  }

  .forgot-secondary {
    background: transparent;
    border: 1px solid #ffdc7b;
    color: #ffdc7b;
  }

  .forgot-submit {
    background: #ffdc7b;
    border: 0;
    color: #080173;
    margin: 10px auto 0;
    min-width: 170px;
  }

  .forgot-secondary:disabled,
  .forgot-submit:disabled {
    cursor: not-allowed;
    opacity: .62;
  }

  .forgot-alert {
    border-radius: 8px;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.35;
    margin: 0 0 14px;
    padding: 11px 12px;
    width: 100%;
  }

  .forgot-alert.success {
    background: rgba(36, 200, 112, .18);
    color: #9dffc8;
  }

  .forgot-alert.error {
    background: rgba(255, 107, 32, .18);
    color: #ffb18a;
  }

  .forgot-footer {
    color: #fff;
    font-size: 13px;
    font-weight: 800;
    margin: 24px 0 0;
    text-align: center;
  }

  .forgot-footer a {
    color: #ff6b20;
    text-decoration: none;
  }

  .forgot-visual {
    align-self: stretch;
    border-radius: 2px;
    min-height: 560px;
    overflow: hidden;
  }

  .forgot-visual img {
    display: block;
    height: 100%;
    object-fit: cover;
    object-position: center;
    width: 100%;
  }

  @media (max-width: 880px) {
    .forgot-shell {
      gap: 28px;
      grid-template-columns: 1fr;
      min-height: 0;
      padding: 28px;
    }

    .forgot-visual {
      min-height: 240px;
      order: -1;
    }
  }

  @media (max-width: 520px) {
    .forgot-page {
      padding: 18px;
    }

    .forgot-shell {
      padding: 22px;
    }

    .forgot-panel {
      width: 100%;
    }

    .forgot-otp-actions {
      grid-template-columns: 1fr;
    }
  }
`;
