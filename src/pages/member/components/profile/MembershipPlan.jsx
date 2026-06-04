import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import MemberLayout from "../../../../components/member/MemberLayout";
import MemberIcon from "../../../../components/member/MemberIcon";
import api from "../../../../components/auth/authApi";
import { authMembershipPlans, getAuthMembershipPlan } from "../../../auth/membership/hooks/authPlans";

const tabs = [
  { label: "Account Settings", icon: "profile", to: "/member/profile" },
  { label: "Membership Plan", icon: "check", active: true, to: "/member/profile/membership" },
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

const normalizePlanId = (planId) => {
  const id = String(planId || "").toLowerCase();
  if (id === "monthly" || id === "bulanan") return "premium";
  if (id === "harian") return "daily";
  return id;
};

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

const getProfilePlanId = (profile, registrationPlanId) =>
  normalizePlanId(
    profile?.membership_plan_id ||
      profile?.membership_plan ||
      profile?.membership_type ||
      profile?.membership?.plan_id ||
      profile?.membership?.plan ||
      profile?.membership?.type ||
      registrationPlanId ||
      "student",
  );

const getMembershipStatus = (profile) => {
  const status = String(profile?.membership_status || profile?.membership?.status || "").toLowerCase();
  if (status === "active" || status === "aktif" || profile?.active_membership) return "Active";
  if (profile?.membership_end_date || profile?.membership?.end_date) return "Pending";
  return "Selected";
};

export default function ProfileMembershipPlanPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrationPlanId, setRegistrationPlanId] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get("/users/me");
        setProfile(response.data?.data || null);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setRegistrationPlanId(normalizePlanId(getStoredRegistrationPlanId(profile)));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [profile]);

  const currentPlanId = getProfilePlanId(profile, registrationPlanId);
  const currentPlan = useMemo(() => getAuthMembershipPlan(currentPlanId), [currentPlanId]);
  const status = getMembershipStatus(profile);
  const startDate = formatDate(profile?.membership_start_date || profile?.membership?.start_date || profile?.created_at);
  const endDate = formatDate(profile?.membership_end_date || profile?.membership?.end_date);

  return (
    <MemberLayout active="Profile">
      <style>{`
        .profile-plan-page {
          display: grid;
          gap: 22px;
        }

        .profile-plan-title {
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
          text-decoration: none;
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

        .profile-plan-hero {
          background: #0b0871;
          border-radius: 12px;
          box-shadow: 0 18px 38px rgba(8, 4, 120, .18);
          color: #ffffff;
          display: grid;
          gap: 22px;
          grid-template-columns: minmax(0, 1fr) auto;
          padding: 28px;
        }

        .profile-plan-label {
          color: #ffe08d;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .profile-plan-hero h2 {
          color: #ffffff;
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 900;
          margin: 8px 0;
        }

        .profile-plan-hero p {
          color: #dfe4ff;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.45;
          margin: 0;
          max-width: 620px;
        }

        .profile-plan-price {
          align-self: center;
          color: #ff7a00;
          font-size: clamp(24px, 4vw, 38px);
          font-weight: 900;
          text-align: right;
          white-space: nowrap;
        }

        .profile-plan-price span {
          color: #dfe4ff;
          display: block;
          font-size: 13px;
          margin-top: 6px;
        }

        .profile-plan-stats {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .profile-plan-stat {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 14px 28px rgba(8, 4, 120, .08);
          padding: 18px;
        }

        .profile-plan-stat span {
          color: #8a8cbe;
          display: block;
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 7px;
          text-transform: uppercase;
        }

        .profile-plan-stat strong {
          color: #0b0871;
          font-size: 17px;
          font-weight: 900;
        }

        .profile-plan-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .profile-plan-card {
          background: #ffffff;
          border: 2px solid transparent;
          border-radius: 12px;
          box-shadow: 0 14px 28px rgba(8, 4, 120, .08);
          display: flex;
          flex-direction: column;
          min-height: 310px;
          padding: 22px;
        }

        .profile-plan-card.is-active {
          border-color: #ff7a00;
        }

        .profile-plan-card h3 {
          color: #0b0871;
          font-size: 17px;
          font-weight: 900;
          margin: 0 0 8px;
        }

        .profile-plan-card p {
          color: #565a91;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.4;
          margin: 0 0 14px;
        }

        .profile-plan-card strong {
          color: #ff7a00;
          display: block;
          font-size: 21px;
          font-weight: 900;
          margin-bottom: 14px;
        }

        .profile-plan-card strong span {
          color: #565a91;
          font-size: 12px;
        }

        .profile-plan-card ul {
          display: grid;
          gap: 9px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .profile-plan-card li {
          color: #292782;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.35;
          padding-left: 18px;
          position: relative;
        }

        .profile-plan-card li::before {
          background: #24c870;
          border-radius: 50%;
          content: "";
          height: 8px;
          left: 0;
          position: absolute;
          top: 5px;
          width: 8px;
        }

        .profile-plan-loading {
          color: #565a91;
          font-size: 13px;
          font-weight: 800;
        }

        @media (max-width: 1040px) {
          .profile-plan-hero,
          .profile-plan-stats,
          .profile-plan-grid {
            grid-template-columns: 1fr;
          }

          .profile-plan-price {
            text-align: left;
          }
        }
      `}</style>

      <section className="profile-plan-page">
        <h1 className="profile-plan-title">Profile</h1>

        <nav className="profile-tabs" aria-label="Profile settings">
          {tabs.map((tab) => (
            tab.to ? (
              <Link className={`profile-tab ${tab.active ? "is-active" : ""}`} key={tab.label} to={tab.to}>
                <MemberIcon name={tab.icon} />
                <span>{tab.label}</span>
              </Link>
            ) : (
              <button className="profile-tab" key={tab.label} type="button">
                <MemberIcon name={tab.icon} />
                <span>{tab.label}</span>
              </button>
            )
          ))}
        </nav>

        {loading && <p className="profile-plan-loading">Memuat membership plan...</p>}

        <section className="profile-plan-hero">
          <div>
            <span className="profile-plan-label">Current Membership</span>
            <h2>{currentPlan.name}</h2>
            <p>{currentPlan.description}</p>
          </div>
          <div className="profile-plan-price">
            {currentPlan.price}
            <span>/ {currentPlan.period}</span>
          </div>
        </section>

        <section className="profile-plan-stats" aria-label="Membership details">
          <div className="profile-plan-stat">
            <span>Status</span>
            <strong>{status}</strong>
          </div>
          <div className="profile-plan-stat">
            <span>Start Date</span>
            <strong>{startDate}</strong>
          </div>
          <div className="profile-plan-stat">
            <span>Active Until</span>
            <strong>{endDate}</strong>
          </div>
        </section>

        <section className="profile-plan-grid" aria-label="Available membership plans">
          {authMembershipPlans.map((plan) => (
            <article className={`profile-plan-card ${plan.id === currentPlan.id ? "is-active" : ""}`} key={plan.id}>
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <strong>
                {plan.price} <span>/ {plan.period}</span>
              </strong>
              <ul>
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </section>
    </MemberLayout>
  );
}
