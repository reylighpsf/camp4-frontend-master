import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { authApi } from "../../../components/auth/hooks/authApi";
import signupGym from "../../../assets/auth/signup-gym.jpg";
import vocafitLogo from "../../../assets/auth/vocafit-logo.png";
import useTurnstile from "../sign/hooks/useTurnstile";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const STEP_REQUEST = "request";
const STEP_VERIFY = "verify";
const STEP_RESET = "reset";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const otpRefs = useRef([]);
  const [step, setStep] = useState(STEP_REQUEST);
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const [expiresIn, setExpiresIn] = useState(15 * 60);
  const {
    containerRef: turnstileRef,
    error: turnstileError,
    reset: resetTurnstile,
    token: turnstileToken,
  } = useTurnstile();

  const otp = useMemo(() => otpDigits.join(""), [otpDigits]);

  useEffect(() => {
    if (step !== STEP_VERIFY) return undefined;
    const intervalId = setInterval(() => {
      setExpiresIn((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [step]);

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const requestOtp = async (mode = "request") => {
    clearFeedback();
    setFieldErrors({});

    if (!isValidEmail(email.trim())) {
      setFieldErrors({ email: "Email tidak valid" });
      return;
    }

    if (!turnstileToken) {
      setError(turnstileError || "Selesaikan verifikasi captcha terlebih dahulu.");
      return;
    }

    setLoading(mode);
    try {
      const payload = { email: email.trim() };
      const response =
        mode === "resend"
          ? await authApi.resendForgotPassword(payload, turnstileToken)
          : await authApi.forgotPassword(payload, turnstileToken);

      setExpiresIn(15 * 60);
      setOtpDigits(Array(6).fill(""));
      setStep(STEP_VERIFY);
      setMessage(response.data?.message || "OTP reset password sudah dikirim ke email kamu.");
      setTimeout(() => otpRefs.current[0]?.focus(), 0);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengirim OTP reset password."));
    } finally {
      resetTurnstile();
      setLoading("");
    }
  };

  const handleOtpChange = (index, value) => {
    clearFeedback();
    const digit = value.replace(/\D/g, "").slice(-1);
    setFieldErrors((current) => ({ ...current, otp: "" }));
    setOtpDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const continueToPassword = (event) => {
    event.preventDefault();
    clearFeedback();
    if (!/^\d{6}$/.test(otp)) {
      setFieldErrors({ otp: "OTP harus 6 digit angka" });
      return;
    }
    setStep(STEP_RESET);
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    clearFeedback();

    const errors = {};
    if (passwords.newPassword.length < 6) errors.newPassword = "Password minimal 6 karakter";
    if (passwords.confirmPassword !== passwords.newPassword) errors.confirmPassword = "Konfirmasi password tidak sama";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!turnstileToken) {
      setError(turnstileError || "Selesaikan verifikasi captcha terlebih dahulu.");
      return;
    }

    setLoading("reset");
    try {
      const response = await authApi.resetPassword({
        email: email.trim(),
        otp,
        newPassword: passwords.newPassword,
      }, turnstileToken);

      navigate("/sign-in", {
        replace: true,
        state: { notice: response.data?.message || "Password berhasil direset. Silakan login." },
      });
    } catch (err) {
      setError(getErrorMessage(err, "Gagal reset password."));
      setStep(STEP_VERIFY);
    } finally {
      resetTurnstile();
      setLoading("");
    }
  };

  const goBack = () => {
    clearFeedback();
    setFieldErrors({});
    if (step === STEP_RESET) {
      setStep(STEP_VERIFY);
      return;
    }
    if (step === STEP_VERIFY) {
      setStep(STEP_REQUEST);
      return;
    }
    navigate("/sign-in");
  };

  const timerText = `${String(Math.floor(expiresIn / 60)).padStart(2, "0")}:${String(expiresIn % 60).padStart(2, "0")}`;

  return (
    <>
      <style>{forgotStyles}</style>
      <main className="forgot-page">
        <button className="forgot-back" onClick={goBack} type="button" aria-label="Back">
          <span aria-hidden="true">←</span>
        </button>

        <section className="forgot-shell" aria-labelledby="forgot-title">
          <div className="forgot-panel">
            {step === STEP_REQUEST && (
              <form className="forgot-form forgot-form-request" onSubmit={(event) => { event.preventDefault(); requestOtp("request"); }} noValidate>
                <img className="forgot-logo" src={vocafitLogo} alt="Vocafit" />
                <h1 id="forgot-title">Forgot Password?</h1>
                <p className="forgot-copy">Enter your registered email address to receive a verification code.</p>

                {message && <p className="forgot-alert success">{message}</p>}
                {error && <p className="forgot-alert error">{error}</p>}
                <div className="forgot-turnstile">
                  <div ref={turnstileRef} />
                  {turnstileError && <span>{turnstileError}</span>}
                </div>

                <label className="forgot-field" htmlFor="email">
                  <span>Email Address</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setFieldErrors((current) => ({ ...current, email: "" }));
                      clearFeedback();
                    }}
                    className={fieldErrors.email ? "has-error" : ""}
                    placeholder="example@mhs.unesa.ac.id"
                    autoComplete="email"
                  />
                  {fieldErrors.email && <small>{fieldErrors.email}</small>}
                </label>

                <button className="forgot-submit" disabled={Boolean(loading)} type="submit">
                  {loading === "request" ? "Requesting..." : "Request OTP"}
                </button>

                <div className="forgot-divider" />
                <p className="forgot-footer">Remember your password? <Link to="/sign-in">Log In</Link></p>
              </form>
            )}

            {step === STEP_VERIFY && (
              <form className="forgot-form forgot-form-verify" onSubmit={continueToPassword} noValidate>
                <h1 id="forgot-title">Verify OTP</h1>
                <p className="forgot-copy">Enter the 6-digit verification code sent to your email address</p>

                {message && <p className="forgot-alert success">{message}</p>}
                {error && <p className="forgot-alert error">{error}</p>}
                <div className="forgot-turnstile">
                  <div ref={turnstileRef} />
                  {turnstileError && <span>{turnstileError}</span>}
                </div>

                <div className="forgot-otp-group" aria-label="OTP code">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => { otpRefs.current[index] = element; }}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      className={fieldErrors.otp ? "has-error" : ""}
                      aria-label={`OTP digit ${index + 1}`}
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                    />
                  ))}
                </div>
                {fieldErrors.otp && <small className="forgot-otp-error">{fieldErrors.otp}</small>}

                <p className="forgot-expire">Code expires in: <span>{timerText}</span></p>

                <button className="forgot-secondary" disabled={Boolean(loading)} onClick={() => requestOtp("resend")} type="button">
                  {loading === "resend" ? "Resending..." : "Resend OTP"}
                </button>
                <button className="forgot-submit" disabled={Boolean(loading)} type="submit">Verify OTP</button>
              </form>
            )}

            {step === STEP_RESET && (
              <form className="forgot-form forgot-form-reset" onSubmit={resetPassword} noValidate>
                <h1 id="forgot-title">Create New Password</h1>
                <p className="forgot-copy">Create a strong password to secure your account</p>

                {error && <p className="forgot-alert error">{error}</p>}
                <div className="forgot-turnstile">
                  <div ref={turnstileRef} />
                  {turnstileError && <span>{turnstileError}</span>}
                </div>

                <label className="forgot-field" htmlFor="newPassword">
                  <span>New Password</span>
                  <input
                    id="newPassword"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(event) => {
                      setPasswords((current) => ({ ...current, newPassword: event.target.value }));
                      setFieldErrors((current) => ({ ...current, newPassword: "" }));
                      clearFeedback();
                    }}
                    className={fieldErrors.newPassword ? "has-error" : ""}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                  />
                  {fieldErrors.newPassword && <small>{fieldErrors.newPassword}</small>}
                </label>

                <label className="forgot-field" htmlFor="confirmPassword">
                  <span>Confirm Password</span>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(event) => {
                      setPasswords((current) => ({ ...current, confirmPassword: event.target.value }));
                      setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
                      clearFeedback();
                    }}
                    className={fieldErrors.confirmPassword ? "has-error" : ""}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                  />
                  {fieldErrors.confirmPassword && <small>{fieldErrors.confirmPassword}</small>}
                </label>

                <button className="forgot-submit" disabled={Boolean(loading)} type="submit">
                  {loading === "reset" ? "Saving..." : "Save Password"}
                </button>
              </form>
            )}
          </div>

          <aside className="forgot-visual" aria-label="Gym preview">
            <img src={signupGym} alt="Gym equipment" />
            <div className="forgot-dots" aria-hidden="true">
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

const forgotStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }

  .forgot-page {
    min-height: 100vh;
    background: #080478;
    color: #fff;
    display: grid;
    font-family: 'DM Sans', sans-serif;
    place-items: center;
    padding: 32px 28px;
    position: relative;
  }

  .forgot-back {
    align-items: center;
    background: transparent;
    border: 0;
    color: #ffdc7b;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 28px;
    font-weight: 900;
    height: 40px;
    justify-content: center;
    left: 28px;
    position: fixed;
    top: 20px;
    width: 40px;
    z-index: 2;
  }

  .forgot-shell {
    align-items: stretch;
    display: grid;
    gap: 78px;
    grid-template-columns: minmax(320px, 360px) minmax(360px, 408px);
    justify-content: center;
    min-height: 544px;
    width: min(100%, 860px);
  }

  .forgot-panel {
    align-self: center;
    display: grid;
    justify-items: center;
    width: 100%;
  }

  .forgot-form {
    display: grid;
    justify-items: center;
    width: 100%;
  }

  .forgot-form-request {
    margin-top: 16px;
  }

  .forgot-form-verify,
  .forgot-form-reset {
    align-self: center;
  }

  .forgot-logo {
    display: block;
    height: auto;
    margin-bottom: 8px;
    width: 84px;
  }

  .forgot-panel h1 {
    color: #ffdc7b;
    font-size: 22px;
    font-weight: 900;
    line-height: 1.1;
    margin: 0 0 12px;
    text-align: center;
  }

  .forgot-copy {
    color: rgba(255,255,255,.86);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.3;
    margin: 0 0 26px;
    max-width: 280px;
    text-align: center;
  }

  .forgot-field {
    display: grid;
    gap: 5px;
    margin-bottom: 18px;
    width: 100%;
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
    height: 34px;
    outline: none;
    padding: 0 10px;
    width: 100%;
  }

  .forgot-field input::placeholder {
    color: rgba(255,255,255,.45);
  }

  .forgot-field input:focus,
  .forgot-otp-group input:focus {
    border-color: #fff;
    box-shadow: 0 0 0 3px rgba(255, 220, 123, .18);
  }

  .forgot-field input.has-error,
  .forgot-otp-group input.has-error {
    border-color: #ff6b20;
  }

  .forgot-field small,
  .forgot-otp-error {
    color: #ffb18a;
    font-size: 11px;
    font-weight: 800;
  }

  .forgot-submit,
  .forgot-secondary {
    align-items: center;
    border-radius: 999px;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 13px;
    font-weight: 900;
    height: 37px;
    justify-content: center;
    width: 100%;
  }

  .forgot-submit {
    background: #ffdc7b;
    border: 0;
    color: #080478;
  }

  .forgot-secondary {
    background: transparent;
    border: 1px solid #ffdc7b;
    color: #ffdc7b;
    margin-bottom: 9px;
  }

  .forgot-submit:hover:not(:disabled),
  .forgot-secondary:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .forgot-submit:disabled,
  .forgot-secondary:disabled {
    cursor: not-allowed;
    opacity: .62;
  }

  .forgot-divider {
    background: rgba(255, 220, 123, .34);
    height: 1px;
    margin: 19px 0 17px;
    width: 100%;
  }

  .forgot-footer {
    color: #fff;
    font-size: 13px;
    font-weight: 900;
    margin: 0;
    text-align: center;
  }

  .forgot-footer a {
    color: #ff6b20;
    text-decoration: none;
  }

  .forgot-alert {
    border-radius: 8px;
    font-size: 11px;
    font-weight: 800;
    line-height: 1.3;
    margin: -10px 0 14px;
    padding: 9px 10px;
    text-align: center;
    width: 100%;
  }

  .forgot-alert.success {
    background: rgba(36, 200, 112, .15);
    color: #9dffc8;
  }

  .forgot-alert.error {
    background: rgba(255, 107, 32, .18);
    color: #ffb18a;
  }

  .forgot-turnstile {
    display: grid;
    justify-items: center;
    margin: 0;
    min-height: 0;
    width: 100%;
  }

  .forgot-turnstile span {
    color: #ffb18a;
    font-size: 11px;
    font-weight: 800;
    margin-top: 6px;
    text-align: center;
  }

  .forgot-otp-group {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(6, 1fr);
    margin-bottom: 16px;
    width: 100%;
  }

  .forgot-otp-group input {
    background: transparent;
    border: 2px solid #ffdc7b;
    border-radius: 6px;
    color: #fff;
    font: inherit;
    font-size: 18px;
    font-weight: 900;
    height: 34px;
    outline: none;
    text-align: center;
    width: 100%;
  }

  .forgot-expire {
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    margin: 0 0 18px;
  }

  .forgot-expire span {
    color: #ff6b20;
  }

  .forgot-visual {
    align-self: stretch;
    min-height: 544px;
    overflow: hidden;
    position: relative;
  }

  .forgot-visual img {
    display: block;
    height: 100%;
    object-fit: cover;
    object-position: center;
    width: 100%;
  }

  .forgot-dots {
    bottom: 14px;
    display: inline-flex;
    gap: 7px;
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
  }

  .forgot-dots span {
    background: rgba(255, 220, 123, .62);
    border-radius: 999px;
    height: 3px;
    width: 18px;
  }

  .forgot-dots span:first-child {
    background: #ff6b20;
    width: 28px;
  }

  @media (max-width: 880px) {
    .forgot-shell {
      gap: 28px;
      grid-template-columns: 1fr;
      min-height: 0;
      width: min(100%, 430px);
    }

    .forgot-visual {
      min-height: 260px;
      order: -1;
    }
  }

  @media (max-width: 520px) {
    .forgot-page {
      padding: 70px 18px 24px;
    }

    .forgot-otp-group {
      gap: 7px;
    }
  }
`;
