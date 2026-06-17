import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AuthFrame, Toast } from "@/features/auth/pages/AuthFrame";
import { useAuth } from "@/hooks/useAuth";
import { buildGoogleRegisterPayload, decodeGoogleCredential } from "@/features/auth/pages/sign/hooks/googleAuthPayload";
import { getGoogleClientId } from "@/features/auth/pages/sign/hooks/googleClientConfig";
import useTurnstile from "@/features/auth/pages/sign/hooks/useTurnstile";

const getPhoneInputDigits = (phoneNumber) =>
  phoneNumber.replace(/^\+62/, "").replace(/^0/, "");

const normalizeIndonesianPhone = (value) => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits ? `+62${digits}` : "";
};

export default function Signup() {
  const { signup, signupGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const googleButtonRef = useRef(null);
  const {
    containerRef: turnstileRef,
    error: turnstileError,
    reset: resetTurnstile,
    token: turnstileToken,
  } = useTurnstile();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
    image: null,
  });
  const [googleCredential, setGoogleCredential] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleConfigLoading, setGoogleConfigLoading] = useState(true);
  const [googleConfigError, setGoogleConfigError] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const notice = location.state?.notice;
    if (!notice) return undefined;

    const timeoutId = setTimeout(() => {
      setToast(notice);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [location.state]);

  useEffect(() => {
    if (!form.image) {
      if (form.googleImageUrl) {
        const timeoutId = setTimeout(() => {
          setImagePreviewUrl(form.googleImageUrl);
        }, 0);
        return () => clearTimeout(timeoutId);
      }

      const timeoutId = setTimeout(() => {
        setImagePreviewUrl("");
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    const previewUrl = URL.createObjectURL(form.image);
    const timeoutId = setTimeout(() => {
      setImagePreviewUrl(previewUrl);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(previewUrl);
    };
  }, [form.googleImageUrl, form.image]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === "file") {
      const selectedFile = files?.[0] || null;
      if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
        setForm((prev) => ({ ...prev, [name]: null }));
        setFieldErrors((prev) => ({
          ...prev,
          [name]: "Ukuran foto maksimal 5MB",
        }));
        if (imageInputRef.current) imageInputRef.current.value = "";
        return;
      }

      setForm((prev) => ({ ...prev, [name]: selectedFile }));
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    if (name === "phoneNumber") {
      setForm((prev) => ({
        ...prev,
        phoneNumber: normalizeIndonesianPhone(value),
      }));
      setFieldErrors((prev) => ({ ...prev, phoneNumber: "" }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (form.fullName.trim().length < 2) {
      errors.fullName = "Nama minimal 2 karakter";
    }
    if (!emailRegex.test(form.email)) errors.email = "Email tidak valid";
    if (!/^\+628[1-9][0-9]{6,10}$/.test(form.phoneNumber.trim())) {
      errors.phoneNumber = "Gunakan format +628xxxxxxxx";
    }
    if (!form.birthDate) {
      errors.birthDate = "Tanggal lahir wajib diisi";
    }
    if (!googleCredential && form.password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }
    if (!googleCredential && form.confirmPassword !== form.password) {
      errors.confirmPassword = "Konfirmasi password tidak sama";
    }
    if (!form.image && !googleCredential) errors.image = "Foto profil wajib diunggah";
    if (!form.acceptedTerms) {
      errors.acceptedTerms = "Kamu perlu menyetujui syarat dan ketentuan";
    }

    return errors;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchGoogleClientId = async () => {
      setGoogleConfigLoading(true);
      setGoogleConfigError("");

      try {
        const clientId = await getGoogleClientId();
        if (!isMounted) return;
        setGoogleClientId(clientId);
        if (!clientId) setGoogleConfigError("Google Client ID kosong dari backend.");
      } catch (err) {
        if (!isMounted) return;
        setGoogleConfigError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Gagal mengambil Google Client ID dari backend.",
        );
      } finally {
        if (isMounted) setGoogleConfigLoading(false);
      }
    };

    fetchGoogleClientId();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return undefined;

    let cancelled = false;

    const handleGoogleCredential = async (response) => {
      if (!response?.credential) {
        setToast("Registrasi Google gagal. Credential tidak diterima.");
        return;
      }

      setToast("");

      const payload = decodeGoogleCredential(response.credential);
      const fullName = payload.name || payload.given_name || payload.email?.split("@")[0] || "";
      const googleRegisterPayload = buildGoogleRegisterPayload(response.credential);
      setGoogleCredential(response.credential);
      setForm((current) => ({
        ...current,
        fullName: fullName || current.fullName,
        email: payload.email || current.email,
        googleImageUrl: payload.picture || "",
        password: "",
        confirmPassword: "",
        googlePassword: googleRegisterPayload.password,
      }));
      setFieldErrors((current) => ({
        ...current,
        fullName: "",
        email: "",
        image: "",
        password: "",
        confirmPassword: "",
      }));
      setToast("Data Google berhasil diambil. Lengkapi nomor HP, tanggal lahir, dan persetujuan.");
      resetTurnstile();
    };

    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        shape: "pill",
        size: "large",
        text: "signup_with",
        theme: "outline",
        width: 260,
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => {
      if (!cancelled) setToast("Gagal memuat registrasi Google.");
    };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [googleClientId, navigate, resetTurnstile, signupGoogle, turnstileToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setToast("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!turnstileToken) {
      setToast(turnstileError || "Selesaikan verifikasi Turnstile terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = form.email.trim();
      if (googleCredential) {
        const googlePayload = buildGoogleRegisterPayload(googleCredential);
        const googleFormData = new FormData();
        googleFormData.append("googleToken", googleCredential);
        googleFormData.append("fullName", form.fullName.trim() || googlePayload.fullName);
        googleFormData.append("phoneNumber", form.phoneNumber.trim());
        googleFormData.append("birthDate", form.birthDate);
        googleFormData.append("password", form.googlePassword || googlePayload.password);
        if (form.image) googleFormData.append("image", form.image);

        await signupGoogle(googleFormData, turnstileToken, { skipFetchMe: true });
        navigate("/choose-plan", { replace: true });
        return;
      }

      const formData = new FormData();
      formData.append("fullName", form.fullName.trim());
      formData.append("email", normalizedEmail);
      formData.append("phoneNumber", form.phoneNumber.trim());
      formData.append("birthDate", form.birthDate);
      formData.append("password", form.password);
      formData.append("image", form.image);

      await signup(formData, turnstileToken);
      localStorage.setItem("vocafit-registration-email", normalizedEmail);
      navigate("/verify-email", { state: { email: normalizedEmail } });
    } catch (err) {
      const res = err.response?.data;
      if (Array.isArray(res)) {
        setToast(res.map((item) => item.message).join(", "));
      } else {
        setToast(
          res?.error ||
            res?.message ||
            "Pendaftaran gagal. Coba beberapa saat lagi.",
        );
      }
    } finally {
      resetTurnstile();
      setLoading(false);
    }
  };

  return (
    <>
      <style>{signupGoogleStyles}</style>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <AuthFrame
        currentStep={1}
        aside={null}
        contentClassName="auth-single-page"
      >
        <h1>Create Your Member Account</h1>
        <p className="auth-subtitle">
          Your account will be used to manage your membership, QR check-in,
          payment history, workout tracking, and trainer booking.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-upload">
            <span className="auth-avatar" aria-hidden="true">
              {imagePreviewUrl ? <img src={imagePreviewUrl} alt="" /> : "+"}
            </span>
            <input
              ref={imageInputRef}
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
            <label className="auth-upload-link" htmlFor="image">
              Tap to upload photo
            </label>
          </div>
          {fieldErrors.image && <p className="auth-error">{fieldErrors.image}</p>}

          <div className="auth-form-grid">
            <div className="auth-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                className={fieldErrors.fullName ? "has-error" : ""}
                placeholder="Enter your full name"
                autoComplete="name"
              />
              {fieldErrors.fullName && (
                <p className="auth-error">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={fieldErrors.email ? "has-error" : ""}
                placeholder="your.email@example.com"
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="auth-error">{fieldErrors.email}</p>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="phoneNumber">Phone Number</label>
              <span className="auth-phone-shell">
                <span className="auth-phone-prefix">+62</span>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={getPhoneInputDigits(form.phoneNumber)}
                  onChange={handleChange}
                  className={fieldErrors.phoneNumber ? "has-error" : ""}
                  placeholder="8123456789"
                  autoComplete="tel"
                />
              </span>
              {fieldErrors.phoneNumber && (
                <p className="auth-error">{fieldErrors.phoneNumber}</p>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="birthDate">Date of Birth</label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={form.birthDate}
                onChange={handleChange}
                className={fieldErrors.birthDate ? "has-error" : ""}
              />
              {fieldErrors.birthDate && (
                <p className="auth-error">{fieldErrors.birthDate}</p>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="signup-password-shell">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className={fieldErrors.password ? "has-error" : ""}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                <button
                  className="signup-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <EyeIcon hidden={showPassword} />
                </button>
              </div>
              {fieldErrors.password && (
                <p className="auth-error">{fieldErrors.password}</p>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="signup-password-shell">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={fieldErrors.confirmPassword ? "has-error" : ""}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button
                  className="signup-password-toggle"
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                >
                  <EyeIcon hidden={showConfirmPassword} />
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="auth-error">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <label className="auth-check">
              <input
                name="acceptedTerms"
                type="checkbox"
                checked={form.acceptedTerms}
                onChange={handleChange}
              />
              I agree to the <Link to="/terms">Terms & Conditions</Link>
            </label>
            {fieldErrors.acceptedTerms && (
              <p className="auth-error auth-field full">
                {fieldErrors.acceptedTerms}
              </p>
            )}
          </div>

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> Loading
              </>
            ) : (
              googleCredential ? "Continue To Choose Plan" : "Continue To Verify Email"
            )}
          </button>

          <div className="signup-turnstile">
            <div ref={turnstileRef} />
            {turnstileError && <span>{turnstileError}</span>}
          </div>

          <div className="signup-divider"><span>atau</span></div>
          <div className="signup-google">
            {googleClientId ? (
              <>
                <div ref={googleButtonRef} />
              </>
            ) : googleConfigLoading ? (
              <div className="signup-google-config-error">Memuat konfigurasi Google dari backend...</div>
            ) : (
              <div className="signup-google-config-error">
                {googleConfigError || "Google register belum aktif. GOOGLE_CLIENT_ID belum tersedia dari backend."}
              </div>
            )}
          </div>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/sign-in">Sign In</Link>
        </p>
      </AuthFrame>
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

const signupGoogleStyles = `
  .signup-password-shell {
    position: relative;
  }

  .signup-password-shell input {
    padding-right: 44px;
    width: 100%;
  }

  .signup-password-toggle {
    align-items: center;
    background: transparent;
    border: 0;
    color: #0b0871;
    cursor: pointer;
    display: inline-flex;
    height: 36px;
    justify-content: center;
    padding: 0;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
  }

  .signup-password-toggle:hover,
  .signup-password-toggle:focus-visible {
    color: #ff7415;
    outline: none;
  }

  .signup-divider {
    align-items: center;
    color: #66709d;
    display: grid;
    font-size: 12px;
    font-weight: 800;
    gap: 10px;
    grid-template-columns: 1fr auto 1fr;
    margin: 18px 0 14px;
    width: 100%;
  }

  .signup-divider::before,
  .signup-divider::after {
    background: #e6e8f1;
    content: "";
    height: 1px;
  }

  .signup-google {
    display: grid;
    gap: 8px;
    justify-items: center;
    min-height: 44px;
    width: 100%;
  }

  .signup-turnstile {
    display: grid;
    justify-items: center;
    margin: 0;
    min-height: 0;
    width: 100%;
  }

  .signup-turnstile span {
    color: #9a3412;
    font-size: 12px;
    font-weight: 800;
    margin-top: 8px;
    text-align: center;
  }

  .signup-google-config-error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    border-radius: 8px;
    color: #9a3412;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.4;
    padding: 11px 12px;
    text-align: center;
    width: min(320px, 100%);
  }
`;
