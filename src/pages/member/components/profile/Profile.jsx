import { useEffect, useMemo, useState } from "react";
import MemberLayout from "../../../../components/member/MemberLayout";
import MemberIcon from "../../../../components/member/MemberIcon";
import api from "../../../../components/auth/authApi";
import { useAuth } from "../../../../components/auth/useAuth";
import { MembershipPackagesContent } from "../membership-packages/MembershipPackages";
import { getAuthMembershipPlan } from "../../../auth/membership/hooks/authPlans";

const tabs = [
  { label: "Account Settings", icon: "profile", active: true },
  { label: "Membership Plan", icon: "check" },
  { label: "Security", icon: "check" },
  { label: "Notifications", icon: "bell" },
];

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getErrorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallback;

const getStoredRegistrationPlanId = (profile) => {
  const email = profile?.email;
  if (email) {
    try {
      const savedPlan = JSON.parse(
        localStorage.getItem(`vocafit-registration-plan-${email}`) || "null",
      );
      if (savedPlan?.planId) return savedPlan.planId;
    } catch {
      return "";
    }
  }

  return localStorage.getItem("vocafit-selected-plan") || "";
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [formValues, setFormValues] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [registrationPlanId, setRegistrationPlanId] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/users/me");
        const nextProfile = response.data?.data || null;
        if (!isMounted) return;
        setProfile(nextProfile);
        setFormValues({
          fullName: nextProfile?.full_name || "",
          email: nextProfile?.email || "",
          password: "",
        });
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err, "Gagal memuat profile."));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setRegistrationPlanId(getStoredRegistrationPlanId(profile));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [profile]);

  const membershipText = useMemo(() => {
    const type = profile?.membership_type || profile?.membership?.type;
    if (!type && registrationPlanId) return getAuthMembershipPlan(registrationPlanId).name;
    if (!type) return "Belum ada membership";
    return `${String(type).charAt(0).toUpperCase()}${String(type).slice(1)} Member`;
  }, [profile, registrationPlanId]);

  const memberId = profile?.id ? `VF${String(profile.id).slice(0, 10).toUpperCase()}` : "VF1234567890";
  const joinDate = formatDate(profile?.created_at);
  const planEndDate = formatDate(profile?.membership_end_date || profile?.membership?.end_date);

  const updateField = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      fullName: formValues.fullName.trim(),
    };
    if (formValues.password.trim()) payload.password = formValues.password;

    try {
      const response = await api.put("/users/me", payload);
      const updatedProfile = response.data?.data || profile;
      setProfile((current) => ({ ...current, ...updatedProfile }));
      setFormValues((current) => ({ ...current, password: "" }));
      setMessage("Profile berhasil diperbarui.");
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menyimpan profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <MemberLayout active="Profile">
      <style>{`
        .profile-page {
          display: grid;
          gap: 22px;
        }

        .profile-title {
          color: #0b0871;
          font-family: 'Anton', sans-serif;
          font-size: 34px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
          margin: 0;
        }

        .profile-tabs {
          align-items: center;
          border-bottom: 1px solid rgba(11, 8, 113, .36);
          display: flex;
          gap: 22px;
          overflow-x: auto;
          padding: 0 4px 10px;
        }

        .profile-tab {
          align-items: center;
          background: transparent;
          border: 0;
          color: #514da5;
          cursor: pointer;
          display: inline-flex;
          flex: 0 0 auto;
          gap: 9px;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          min-height: 32px;
          padding: 0;
        }

        .profile-tab svg {
          height: 18px;
          width: 18px;
        }

        .profile-tab.is-active {
          color: #ff7a00;
          position: relative;
        }

        .profile-tab.is-active::after {
          background: #ff7a00;
          border-radius: 999px;
          bottom: -11px;
          content: "";
          height: 3px;
          left: 0;
          position: absolute;
          right: 0;
        }

        .profile-grid {
          align-items: start;
          display: grid;
          gap: 22px;
          grid-template-columns: 330px minmax(0, 1fr);
        }

        .profile-card,
        .profile-form-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 14px 28px rgba(8, 4, 120, .08);
        }

        .profile-card {
          display: grid;
          justify-items: center;
          min-height: 356px;
          padding: 28px 22px 24px;
        }

        .profile-avatar-wrap {
          position: relative;
        }

        .profile-avatar,
        .profile-avatar-image {
          border-radius: 50%;
          height: 112px;
          width: 112px;
        }

        .profile-avatar {
          align-items: center;
          background: #0b0871;
          color: #ffffff;
          display: inline-flex;
          justify-content: center;
          overflow: hidden;
        }

        .profile-avatar svg {
          height: 58px;
          width: 58px;
        }

        .profile-avatar-image {
          display: block;
          object-fit: cover;
        }

        .profile-camera {
          align-items: center;
          background: #ff7a00;
          border: 3px solid #ffffff;
          border-radius: 50%;
          bottom: 5px;
          color: #ffffff;
          display: inline-flex;
          height: 34px;
          justify-content: center;
          position: absolute;
          right: -2px;
          width: 34px;
        }

        .profile-camera svg {
          height: 17px;
          width: 17px;
        }

        .profile-name {
          color: #0b0871;
          font-size: 15px;
          font-weight: 900;
          margin-top: 16px;
          text-align: center;
        }

        .profile-role {
          color: #7a7db5;
          font-size: 12px;
          font-weight: 800;
          margin-top: 3px;
          text-align: center;
        }

        .profile-meta-list {
          display: grid;
          gap: 8px;
          margin-top: 28px;
          width: 100%;
        }

        .profile-meta {
          align-items: center;
          background: #f4f5fb;
          border-radius: 8px;
          color: #0b0871;
          display: flex;
          gap: 12px;
          min-height: 58px;
          padding: 10px 14px;
        }

        .profile-meta svg {
          color: #6f72b5;
          flex: 0 0 auto;
          height: 18px;
          width: 18px;
        }

        .profile-meta span {
          color: #8a8cbe;
          display: block;
          font-size: 10px;
          font-weight: 900;
          margin-bottom: 3px;
        }

        .profile-meta strong {
          display: block;
          font-size: 11px;
          font-weight: 900;
          overflow-wrap: anywhere;
        }

        .profile-form-card {
          min-height: 310px;
          padding: 26px 24px 24px;
        }

        .profile-form-card h2 {
          color: #0b0871;
          font-size: 16px;
          font-weight: 900;
          margin: 0 0 20px;
        }

        .profile-form {
          display: grid;
          gap: 18px;
        }

        .profile-form-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .profile-field {
          color: #0b0871;
          display: grid;
          gap: 8px;
          font-size: 12px;
          font-weight: 900;
        }

        .profile-field.is-wide {
          grid-column: 1 / -1;
        }

        .profile-input {
          background: #f4f5fb;
          border: 1px solid transparent;
          border-radius: 9px;
          color: #0b0871;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          height: 47px;
          outline: 0;
          padding: 0 16px;
          width: 100%;
        }

        .profile-input:focus {
          border-color: #ff7a00;
          box-shadow: 0 0 0 3px rgba(255, 122, 0, .14);
        }

        .profile-input:disabled {
          color: #6f72a6;
          cursor: not-allowed;
        }

        .profile-actions {
          display: flex;
          justify-content: flex-end;
        }

        .profile-save {
          background: #ff7a00;
          border: 0;
          border-radius: 8px;
          box-shadow: 0 10px 18px rgba(255, 122, 0, .24);
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 900;
          height: 38px;
          min-width: 136px;
          padding: 0 18px;
        }

        .profile-save:disabled {
          cursor: not-allowed;
          opacity: .62;
        }

        .profile-alert {
          border-radius: 8px;
          font-size: 13px;
          font-weight: 800;
          padding: 12px 14px;
        }

        .profile-alert.success {
          background: #edfdf3;
          color: #16794c;
        }

        .profile-alert.error {
          background: #fff1f0;
          color: #c73822;
        }

        .profile-loading {
          color: #565a91;
          font-size: 13px;
          font-weight: 800;
        }

        .profile-membership-section {
          display: grid;
          gap: 18px;
          margin-top: 6px;
        }

        .profile-membership-section > h2 {
          color: #0b0871;
          font-family: 'Anton', sans-serif;
          font-size: 28px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
          margin: 0;
        }

        @media (max-width: 1040px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }

          .profile-card {
            justify-items: start;
          }
        }

        @media (max-width: 700px) {
          .profile-form-grid {
            grid-template-columns: 1fr;
          }

          .profile-actions {
            justify-content: stretch;
          }

          .profile-save {
            width: 100%;
          }
        }
      `}</style>

      <section className="profile-page">
        <h1 className="profile-title">Profile</h1>

        <nav className="profile-tabs" aria-label="Profile settings">
          {tabs.map((tab) => (
            <button
              className={`profile-tab ${tab.active ? "is-active" : ""}`}
              key={tab.label}
              type="button"
            >
              <MemberIcon name={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {loading && <p className="profile-loading">Memuat profile...</p>}
        {error && <div className="profile-alert error">{error}</div>}
        {message && <div className="profile-alert success">{message}</div>}

        <div className="profile-grid">
          <aside className="profile-card">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {profile?.profile_image_url ? (
                  <img className="profile-avatar-image" src={profile.profile_image_url} alt="" />
                ) : (
                  <MemberIcon name="flower" />
                )}
              </div>
              <span className="profile-camera" aria-hidden="true">
                <CameraIcon />
              </span>
            </div>

            <div>
              <div className="profile-name">{profile?.full_name || formValues.fullName || "Member"}</div>
              <div className="profile-role">{membershipText}</div>
            </div>

            <div className="profile-meta-list">
              <div className="profile-meta">
                <MemberIcon name="profile" />
                <div>
                  <span>Member ID</span>
                  <strong>{memberId}</strong>
                </div>
              </div>
              <div className="profile-meta">
                <MemberIcon name="calendar" />
                <div>
                  <span>Join Date</span>
                  <strong>{joinDate}</strong>
                </div>
              </div>
              <div className="profile-meta">
                <MemberIcon name="card" />
                <div>
                  <span>Membership Ends</span>
                  <strong>{planEndDate}</strong>
                </div>
              </div>
            </div>
          </aside>

          <section className="profile-form-card">
            <h2>Personal Information</h2>
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="profile-form-grid">
                <label className="profile-field">
                  Full Name
                  <input
                    className="profile-input"
                    value={formValues.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </label>
                <label className="profile-field">
                  Email
                  <input className="profile-input" value={formValues.email} disabled />
                </label>
                <label className="profile-field">
                  Role
                  <input className="profile-input" value={profile?.role || "member"} disabled />
                </label>
                <label className="profile-field">
                  Membership
                  <input className="profile-input" value={membershipText} disabled />
                </label>
                <label className="profile-field is-wide">
                  New Password
                  <input
                    className="profile-input"
                    type="password"
                    value={formValues.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                  />
                </label>
              </div>

              <div className="profile-actions">
                <button className="profile-save" disabled={saving || loading} type="submit">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <section className="profile-membership-section">
          <h2>Membership Plan</h2>
          <MembershipPackagesContent />
        </section>
      </section>
    </MemberLayout>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 6l1.5-2h3L15 6h3a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
