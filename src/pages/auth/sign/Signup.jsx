import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthFrame, Toast } from "../AuthFrame";
import { useAuth } from "../../../components/auth/useAuth";
import { buildGoogleRegisterPayload } from "./googleAuthPayload";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const googleButtonRef = useRef(null);

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  useEffect(() => {
    if (!form.image) {
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
  }, [form.image]);

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
    if (form.password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }
    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Konfirmasi password tidak sama";
    }
    if (!form.image) errors.image = "Foto profil wajib diunggah";
    if (!form.acceptedTerms) {
      errors.acceptedTerms = "Kamu perlu menyetujui syarat dan ketentuan";
    }

    return errors;
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return undefined;

    let cancelled = false;

    const handleGoogleCredential = async (response) => {
      if (!response?.credential) {
        setToast("Registrasi Google gagal. Credential tidak diterima.");
        return;
      }

      setToast("");

      setGoogleLoading(true);
      try {
        await signupGoogle(buildGoogleRegisterPayload(response.credential));
        navigate("/choose-plan");
      } catch (err) {
        const res = err.response?.data;
        setToast(res?.error || res?.message || "Registrasi Google gagal. Coba beberapa saat lagi.");
      } finally {
        setGoogleLoading(false);
      }
    };

    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
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
  }, [navigate, signupGoogle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setToast("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      const normalizedEmail = form.email.trim();
      formData.append("fullName", form.fullName.trim());
      formData.append("email", normalizedEmail);
      formData.append("phoneNumber", form.phoneNumber.trim());
      formData.append("birthDate", form.birthDate);
      formData.append("password", form.password);
      formData.append("image", form.image);

      await signup(formData);
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
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className={fieldErrors.password ? "has-error" : ""}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              {fieldErrors.password && (
                <p className="auth-error">{fieldErrors.password}</p>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={fieldErrors.confirmPassword ? "has-error" : ""}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
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
              "Continue To Verify Email"
            )}
          </button>

          {GOOGLE_CLIENT_ID ? (
            <>
              <div className="signup-divider"><span>atau</span></div>
              <div className={`signup-google ${googleLoading ? "is-loading" : ""}`}>
                <div ref={googleButtonRef} />
                {googleLoading && <span className="signup-google-loading">Memproses Google...</span>}
              </div>
            </>
          ) : (
            null
          )}
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/sign-in">Sign In</Link>
        </p>
      </AuthFrame>
    </>
  );
}

const signupGoogleStyles = `
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

  .signup-google.is-loading {
    opacity: .72;
    pointer-events: none;
  }

  .signup-google-loading {
    color: #171267;
    font-size: 12px;
    font-weight: 800;
    margin: 0;
    text-align: center;
  }
`;
