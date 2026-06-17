import { useEffect, useState } from "react";
import { Link } from "react-router";
import gymImage from "../../../assets/auth/signup-gym.jpg";
import vocafitLogo from "../../../assets/auth/vocafit-logo.png";
import api from "@/components/auth/hooks/authApi";
import { authMembershipPlans, mapCatalogsToMembershipPlans } from "../../../pages/auth/membership/hooks/authPlans";
import MembershipPlanCards from "@/components/landing/membership/MembershipPlanCards";

const steps = [
  ["Create Account", "Sign up and complete your member profile."],
  ["Verify Email", "Confirm your email before choosing a membership."],
  ["Choose Your Plan", "Select the membership that fits your routine."],
  ["Complete Payment", "Confirm your package through secure payment."],
  ["Get QR Code", "Use your member QR code for gym check-in."],
];

const benefits = [
  "Workout Dashboard",
  "Check-in / Check-out",
  "Workout Tracking",
  "Trainer Booking",
];

const faqs = [
  "Can I upgrade my plan later?",
  "What payment methods are available?",
  "Can I book a trainer after becoming a member?",
  "Do I receive a member QR code?",
];

export default function MembershipPage() {
  const [plans, setPlans] = useState(authMembershipPlans);

  useEffect(() => {
    let isMounted = true;

    const fetchCatalogPlans = async () => {
      try {
        const response = await api.get("/catalogs/membership");
        if (isMounted) setPlans(mapCatalogsToMembershipPlans(response.data?.data || []));
      } catch {
        if (isMounted) setPlans(authMembershipPlans);
      }
    };

    fetchCatalogPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="membership-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: #0a1185;
        }

        .membership-page {
          background:
            linear-gradient(180deg, #0a1185 0%, #0a1185 58%, #070b62 100%);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        .membership-nav {
          align-items: center;
          background: rgba(10, 17, 133, .92);
          display: flex;
          gap: 24px;
          justify-content: space-between;
          padding: 18px clamp(22px, 6vw, 112px);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .membership-brand {
          align-items: center;
          color: #ff8a00;
          display: inline-flex;
          font-size: clamp(15px, 1.15vw, 20px);
          font-weight: 800;
          gap: 12px;
          text-decoration: none;
        }

        .membership-brand img {
          height: clamp(34px, 3vw, 44px);
          object-fit: contain;
          width: clamp(34px, 3vw, 44px);
        }

        .membership-nav-links {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          gap: clamp(14px, 2.2vw, 30px);
          justify-content: flex-end;
        }

        .membership-nav-links a {
          color: #fff;
          font-size: clamp(12px, 0.9vw, 15px);
          font-weight: 800;
          text-decoration: none;
        }

        .membership-nav-links a:hover {
          color: #ffb000;
        }

        .membership-nav-links .nav-join {
          background: #ff7a00;
          border-radius: 999px;
          padding: 11px 20px;
        }

        .membership-hero {
          align-items: center;
          display: grid;
          gap: clamp(32px, 5vw, 78px);
          grid-template-columns: minmax(0, 1.05fr) minmax(280px, .95fr);
          min-height: clamp(560px, 75vh, 760px);
          padding: clamp(42px, 6vw, 78px) clamp(22px, 6vw, 112px) clamp(52px, 7vw, 92px);
        }

        .membership-hero-copy {
          max-width: 720px;
        }

        .membership-hero h1 {
          color: #fff;
          font-family: 'Anton', sans-serif;
          font-size: clamp(48px, 7.6vw, 118px);
          font-weight: 400;
          letter-spacing: 0;
          line-height: .96;
          text-transform: uppercase;
        }

        .membership-hero p {
          color: #dfe4ff;
          font-size: clamp(14px, 1vw, 17px);
          font-weight: 800;
          line-height: 1.45;
          margin-top: 16px;
          max-width: 560px;
        }

        .membership-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
        }

        .membership-primary-btn,
        .membership-secondary-btn {
          align-items: center;
          border-radius: 999px;
          display: inline-flex;
          font-size: clamp(12px, .9vw, 15px);
          font-weight: 900;
          justify-content: center;
          min-height: 44px;
          padding: 0 20px;
          text-decoration: none;
        }

        .membership-primary-btn {
          background: #ff7a00;
          color: #fff;
        }

        .membership-secondary-btn {
          border: 2px solid rgba(255,255,255,.34);
          color: #fff;
        }

        .membership-hero-visual {
          aspect-ratio: 4 / 5;
          background:
            linear-gradient(180deg, rgba(10,17,133,.06), rgba(10,17,133,.72)),
            var(--membership-hero-image) center / cover;
          border-radius: 8px;
          box-shadow: 0 26px 70px rgba(0,0,0,.34);
          min-height: 420px;
          overflow: hidden;
          position: relative;
        }

        .membership-hero-badge {
          background: #fff;
          border-radius: 8px;
          bottom: 18px;
          color: #0a1185;
          display: grid;
          gap: 4px;
          left: 18px;
          padding: 16px 18px;
          position: absolute;
          right: 18px;
        }

        .membership-hero-badge strong {
          color: #ff7a00;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .membership-hero-badge span {
          font-size: 14px;
          font-weight: 900;
        }

        .membership-section {
          padding: clamp(40px, 5vw, 68px) clamp(22px, 6vw, 112px);
          text-align: center;
        }

        .membership-section.is-light {
          background: #f1f2f5;
          color: #0a1185;
        }

        .membership-section.is-light h2 {
          color: #0a1185;
        }

        .membership-section.is-light > p {
          color: #454b7c;
        }

        .membership-section h2 {
          color: #fff;
          font-family: 'Anton', sans-serif;
          font-size: clamp(30px, 4.4vw, 58px);
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
          text-transform: uppercase;
        }

        .membership-section > p {
          color: #dfe4ff;
          font-size: clamp(13px, 1vw, 16px);
          font-weight: 700;
          margin: 8px auto 28px;
        }

        .membership-plans {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          margin: 0 auto;
          width: min(100%, 1060px);
        }

        .membership-plan {
          background: #fff;
          border: 3px solid transparent;
          border-radius: 8px;
          box-shadow: 0 16px 34px rgba(0,0,0,.16);
          color: #0a1185;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          min-height: 320px;
          padding: clamp(18px, 2vw, 28px);
          text-align: left;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          will-change: transform;
        }

        .membership-plan.is-featured {
          background: #fff;
          border-color: transparent;
          box-shadow: 0 16px 34px rgba(0,0,0,.16);
          color: #0a1185;
          transform: none;
        }

        .membership-plan:hover {
          box-shadow: 0 24px 50px rgba(0,0,0,.24);
          transform: translateY(-6px);
        }

        .membership-plan.is-featured:hover {
          transform: translateY(-6px);
        }

        .membership-plan:active {
          transform: translateY(-2px) scale(.992);
        }

        .membership-plan.is-featured:active {
          transform: translateY(-2px) scale(.992);
        }

        .plan-kicker {
          color: #ff7a00;
          font-size: clamp(13px, 1vw, 16px);
          font-weight: 900;
          text-transform: uppercase;
        }

        .membership-plan h2 {
          color: inherit;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(26px, 3vw, 42px);
          font-weight: 900;
          margin-top: 8px;
          text-transform: none;
        }

        .membership-plan span {
          color: inherit;
          font-size: 13px;
          font-weight: 800;
          opacity: .78;
        }

        .membership-price-list {
          border: 1px solid rgba(10, 17, 133, .12);
          border-radius: 8px;
          display: grid;
          margin-top: 16px;
          overflow: hidden;
        }

        .membership-plan.is-featured .membership-price-list {
          border-color: rgba(10, 17, 133, .12);
        }

        .membership-price-row {
          align-items: center;
          background: rgba(10, 17, 133, .04);
          display: grid;
          gap: 10px;
          grid-template-columns: minmax(0, 1fr) auto;
          min-height: 38px;
          padding: 8px 10px;
        }

        .membership-plan.is-featured .membership-price-row {
          background: rgba(10, 17, 133, .04);
        }

        .membership-price-row + .membership-price-row {
          border-top: 1px solid rgba(10, 17, 133, .1);
        }

        .membership-plan.is-featured .membership-price-row + .membership-price-row {
          border-top-color: rgba(10, 17, 133, .1);
        }

        .membership-price-row span {
          font-size: 11px;
          line-height: 1.2;
          opacity: .82;
        }

        .membership-price-row b {
          color: #ff7a00;
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .membership-plan ul {
          display: grid;
          gap: 10px;
          list-style: none;
          margin: 22px 0;
        }

        .membership-plan li {
          color: inherit;
          font-size: clamp(12px, .95vw, 15px);
          font-weight: 800;
          line-height: 1.35;
          padding-left: 22px;
          position: relative;
        }

        .membership-plan li::before {
          background: #28c76f;
          border-radius: 50%;
          content: '';
          height: 10px;
          left: 0;
          position: absolute;
          top: 5px;
          width: 10px;
        }

        .membership-plan a,
        .membership-cta a {
          align-items: center;
          background: #ff7a00;
          border-radius: 999px;
          color: #fff;
          display: inline-flex;
          font-size: clamp(12px, .9vw, 15px);
          font-weight: 900;
          justify-content: center;
          margin-top: auto;
          min-height: 42px;
          padding: 0 18px;
          text-decoration: none;
        }

        .steps-grid,
        .benefit-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          margin: 24px auto 0;
          width: min(100%, 1120px);
        }

        .step-card {
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 8px;
          min-height: 132px;
          padding: 20px 16px;
        }

        .step-card span {
          align-items: center;
          background: #ff7a00;
          border-radius: 50%;
          display: inline-flex;
          font-weight: 900;
          height: 34px;
          justify-content: center;
          margin-bottom: 12px;
          width: 34px;
        }

        .step-card h3,
        .benefit-card h3 {
          font-size: clamp(13px, 1vw, 16px);
          font-weight: 900;
          margin-bottom: 6px;
        }

        .step-card p,
        .benefit-card p,
        .faq-list p {
          color: #dfe4ff;
          font-size: clamp(12px, .9vw, 14px);
          line-height: 1.45;
        }

        .benefit-card {
          background: #ffe6bd;
          border-radius: 8px;
          box-shadow: 0 14px 28px rgba(0,0,0,.12);
          color: #0a1185;
          min-height: 132px;
          padding: 22px 16px;
        }

        .benefit-card span {
          background: #0a1185;
          border-radius: 50%;
          display: block;
          height: 30px;
          margin: 0 auto 12px;
          width: 30px;
        }

        .benefit-card p {
          color: #454b7c;
        }

        .faq-list {
          display: grid;
          gap: 10px;
          margin: 22px auto 0;
          width: min(100%, 760px);
        }

        .faq-list details {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 10px 24px rgba(0,0,0,.12);
          color: #0a1185;
          text-align: left;
        }

        .faq-list summary {
          cursor: pointer;
          font-size: clamp(12px, .95vw, 15px);
          font-weight: 900;
          list-style: none;
          padding: 14px 18px;
        }

        .faq-list summary::-webkit-details-marker {
          display: none;
        }

        .faq-list p {
          color: #555;
          padding: 0 18px 14px;
        }

        .membership-cta {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 18px 40px rgba(0,0,0,.18);
          color: #0a1185;
          margin: 0 auto;
          padding: clamp(24px, 3vw, 36px);
          width: min(100%, 820px);
        }

        .membership-cta h2 {
          color: #0a1185;
          font-size: clamp(24px, 3vw, 42px);
        }

        .membership-cta p {
          color: #454b7c;
          margin-bottom: 18px;
        }

        @media (max-width: 860px) {
          .membership-plans,
          .steps-grid,
          .benefit-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .membership-hero {
            grid-template-columns: 1fr;
          }

          .membership-hero-visual {
            aspect-ratio: 16 / 10;
            min-height: 320px;
          }

          .membership-plan.is-featured {
            transform: none;
          }
        }

        @media (max-width: 620px) {
          .membership-nav,
          .membership-nav-links {
            align-items: flex-start;
            flex-direction: column;
          }

          .membership-hero,
          .membership-plans,
          .steps-grid,
          .benefit-grid {
            grid-template-columns: 1fr;
          }

          .membership-hero {
            min-height: auto;
          }

          .membership-hero h1 {
            font-size: clamp(46px, 14vw, 72px);
          }

          .membership-hero-actions {
            flex-direction: column;
          }

          .membership-primary-btn,
          .membership-secondary-btn {
            width: 100%;
          }
        }
      `}</style>

      <nav className="membership-nav" aria-label="Navigasi membership">
        <Link className="membership-brand" to="/">
          <img src={vocafitLogo} alt="Vocafit" />
          <span>Vocafit</span>
        </Link>
        <div className="membership-nav-links">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/sign-in">Sign In</Link>
          <Link className="nav-join" to="/sign-up">
            Join Us
          </Link>
        </div>
      </nav>

      <section className="membership-hero">
        <div className="membership-hero-copy">
          <h1>Start Your Fitness Journey With Vocafit</h1>
          <p>Choose the membership plan that fits your routine and unlock member gym access, workout tracking, trainer schedule, and support.</p>
          <div className="membership-hero-actions">
            <a className="membership-primary-btn" href="#plans">View Plans</a>
            <Link className="membership-secondary-btn" to="/sign-up">Join Us</Link>
          </div>
        </div>
        <div
          className="membership-hero-visual"
          style={{ "--membership-hero-image": `url(${gymImage})` }}
          aria-hidden="true"
        >
          <div className="membership-hero-badge">
            <strong>Member Access</strong>
            <span>QR check-in, workout tracking, and trainer booking in one account.</span>
          </div>
        </div>
      </section>

      <section className="membership-section is-light" id="plans">
        <h2>Choose Your Membership Plan</h2>
        <p>Find the best option based on your needs.</p>
        <MembershipPlanCards plans={plans} />
      </section>

      <section className="membership-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          {steps.map(([title, text], index) => (
            <article className="step-card" key={title}>
              <span>{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="membership-section">
        <h2>What You'll Unlock as a Member</h2>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit}>
              <span aria-hidden="true" />
              <h3>{benefit}</h3>
              <p>Available inside your Vocafit member area.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="membership-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq}>
              <summary>{faq}</summary>
              <p>Yes. You can manage membership actions from your account dashboard.</p>
            </details>
          ))}
        </div>
      </section>

      <section className="membership-section">
        <div className="membership-cta">
          <h2>Ready to Become a Vocafit Member?</h2>
          <p>Pick your plan and start building a healthier routine today.</p>
          <Link to="/sign-up">Join Us</Link>
        </div>
      </section>
    </main>
  );
}
