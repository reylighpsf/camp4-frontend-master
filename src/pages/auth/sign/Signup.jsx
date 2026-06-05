import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AuthFrame, Toast } from "../AuthFrame";
import { useAuth } from "../../../components/auth/useAuth";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
    image: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
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
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/sign-in">Sign In</Link>
        </p>
      </AuthFrame>
    </>
  );
}
