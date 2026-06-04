import { useEffect } from "react";
import Home from "../../components/landing/home/Home";
import Explore from "../../components/landing/explore/Explore";
import MembershipPlanCards from "../../components/landing/membership/MembershipPlanCards";
import Facilities from "../../components/landing/facilities/Facilities";
import Footer from "../../components/landing/footer/Footer";

export default function LandingPage({ scrollToExplore = false }) {
  useEffect(() => {
    if (!scrollToExplore) return;

    const exploreSection = document.getElementById("explore");
    exploreSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollToExplore]);

  return (
    <main className="landing-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html,
        body,
        #root {
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        body {
          background: #0a1185;
        }

        .landing-page {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          overflow-x: hidden;
          background: #f1f2f5;
          color: #0a1185;
          font-family: 'DM Sans', sans-serif;
        }

        .landing-home {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          position: relative;
          overflow: hidden;
          padding: 18px clamp(22px, 6vw, 112px) 0;
          display: flex;
          flex-direction: column;
          background:
            linear-gradient(90deg, rgba(10, 17, 133, 0.98) 0%, rgba(10, 17, 133, 0.88) 46%, rgba(10, 17, 133, 0.44) 100%),
            var(--hero-image) center / cover;
        }

        .landing-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .landing-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #ff8a00;
          text-decoration: none;
          font-size: clamp(15px, 1.15vw, 20px);
          font-weight: 800;
        }

        .landing-brand img {
          width: clamp(34px, 3vw, 44px);
          height: clamp(34px, 3vw, 44px);
          object-fit: contain;
        }

        .landing-links {
          display: flex;
          align-items: center;
          gap: clamp(14px, 2.2vw, 30px);
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .landing-links a {
          color: #fff;
          text-decoration: none;
          font-size: clamp(12px, 0.9vw, 15px);
          font-weight: 700;
        }

        .landing-links a:hover {
          color: #ffb000;
        }

        .landing-links .nav-join {
          background: #ff7a00;
          border-radius: 999px;
          color: #fff;
          padding: 11px 20px;
        }

        .landing-hero {
          width: 100%;
          flex: 1;
          display: flex;
          align-items: center;
          margin: 0 auto;
          padding: clamp(56px, 8vh, 120px) 0 clamp(72px, 9vh, 120px);
          position: relative;
          z-index: 2;
        }

        .landing-hero-copy {
          max-width: min(58vw, 760px);
        }

        .landing-hero h1 {
          color: #fff;
          font-family: 'Anton', sans-serif;
          font-size: clamp(76px, 9.4vw, 160px);
          font-weight: 400;
          line-height: 0.96;
          letter-spacing: 0;
          margin-bottom: clamp(14px, 2vw, 26px);
          text-transform: uppercase;
        }

        .landing-hero-copy p {
          color: #fff;
          font-size: clamp(16px, 1.4vw, 23px);
          font-weight: 700;
          line-height: 1.4;
          max-width: 520px;
          text-transform: uppercase;
        }

        .landing-actions {
          display: flex;
          margin-top: clamp(18px, 2.6vw, 34px);
        }

        .landing-primary-btn {
          min-height: clamp(42px, 3.5vw, 52px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 0 clamp(18px, 2vw, 28px);
          text-decoration: none;
          font-size: clamp(12px, 0.9vw, 15px);
          font-weight: 800;
          background: #ff7a00;
          color: #fff;
        }

        .explore-ticker {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          gap: 0;
          overflow: hidden;
          background: #161616;
          color: #fff;
          white-space: nowrap;
          z-index: 3;
        }

        .explore-ticker span {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 14px clamp(18px, 2.2vw, 30px);
          font-size: clamp(16px, 1.4vw, 22px);
          font-weight: 900;
          text-transform: uppercase;
        }

        .explore-ticker span::before {
          content: '';
          display: block;
          width: 11px;
          height: 11px;
          background: #ffb000;
          border-radius: 50%;
        }

        .landing-section {
          padding: clamp(28px, 4vw, 48px) clamp(22px, 6vw, 112px) clamp(52px, 6vw, 84px);
          width: 100%;
          max-width: none;
          margin: 0 auto;
        }

        .explore-heading,
        .explore-grid {
          width: 100%;
          margin-left: auto;
          margin-right: auto;
        }

        .explore-heading {
          text-align: center;
          margin-bottom: 18px;
        }

        .explore-heading p {
          color: #0a1185;
          font-size: clamp(12px, 1vw, 16px);
          font-weight: 800;
          margin-bottom: 14px;
          text-decoration: underline;
        }

        .explore-tabs {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .explore-tabs button {
          border: 0;
          border-radius: 999px;
          background: #ffd45f;
          color: #0a1185;
          cursor: pointer;
          font-size: clamp(11px, 0.85vw, 14px);
          font-weight: 800;
          padding: 8px 22px;
        }

        .explore-tabs button:nth-child(n + 2) {
          background: #ff7a00;
          color: #fff;
        }

        .explore-tabs button.is-active {
          background: #0a1185;
          color: #fff;
        }

        .explore-status {
          color: #0a1185;
          font-size: clamp(12px, 0.9vw, 14px);
          font-weight: 800;
          margin: 0 auto 18px;
          text-align: center;
        }

        .explore-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(220px, 1fr));
          gap: clamp(14px, 1.4vw, 22px);
        }

        .explore-card {
          min-height: clamp(132px, 11vw, 176px);
          background: #d9d9d9;
          border-radius: 8px;
          color: #202020;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .explore-card-image {
          aspect-ratio: 16 / 9;
          display: block;
          object-fit: cover;
          width: 100%;
        }

        .explore-card-body {
          padding: clamp(16px, 1.7vw, 24px);
        }

        .explore-card span {
          display: inline-flex;
          border-radius: 999px;
          background: #f3c645;
          color: #fff;
          font-size: clamp(10px, 0.75vw, 12px);
          font-weight: 800;
          margin-bottom: 8px;
          padding: 4px 10px;
        }

        .explore-card h3 {
          color: #ff7a00;
          font-size: clamp(13px, 1vw, 17px);
          font-weight: 900;
          margin-bottom: 6px;
        }

        .explore-card p {
          color: #555;
          font-size: clamp(12px, 0.9vw, 15px);
          line-height: 1.45;
          min-height: 34px;
        }

        .explore-card a {
          color: #0a1185;
          display: inline-block;
          font-size: clamp(11px, 0.85vw, 13px);
          font-weight: 900;
          margin-top: 8px;
          text-decoration: none;
        }

        .landing-info {
          background:
            linear-gradient(90deg, rgba(10, 17, 133, 0.95), rgba(10, 17, 133, 0.88)),
            var(--info-image) center / cover;
          padding: clamp(36px, 5vw, 72px) clamp(22px, 6vw, 112px);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px 60px;
          width: min(100%, 980px);
          max-width: none;
          margin: 0 auto;
        }

        .info-item {
          align-items: center;
          border-left: 4px solid #ff7a00;
          display: flex;
          gap: 16px;
          min-height: clamp(74px, 6vw, 96px);
          padding-left: 18px;
        }

        .info-item span,
        .why-card span {
          border: 3px solid #ffd45f;
          border-radius: 50%;
          display: block;
          flex: 0 0 auto;
          height: clamp(36px, 3.4vw, 50px);
          width: clamp(36px, 3.4vw, 50px);
        }

        .info-item h3 {
          color: #ffd45f;
          font-size: clamp(17px, 1.4vw, 24px);
          font-weight: 900;
          margin-bottom: 4px;
        }

        .info-item p {
          color: #fff;
          font-size: clamp(13px, 1vw, 17px);
          font-weight: 700;
        }

        .landing-facilities {
          background: #0a1185;
          color: #fff;
          overflow: hidden;
          padding: clamp(58px, 7vw, 96px) 0 clamp(72px, 8vw, 112px);
        }

        .facilities-title {
          width: min(100%, 1320px);
          max-width: none;
          margin: 0 auto 28px;
          padding: 0 clamp(22px, 6vw, 112px);
          position: relative;
        }

        .facilities-title h2 {
          color: #ffd45f;
          font-family: 'Anton', sans-serif;
          font-size: clamp(52px, 7vw, 96px);
          font-weight: 400;
          letter-spacing: 0;
          line-height: 0.95;
          text-transform: uppercase;
        }

        .facilities-title h2::after {
          color: rgba(255, 255, 255, 0.12);
          content: 'FACILITIES';
          font-size: clamp(78px, 13vw, 184px);
          left: clamp(22px, 6vw, 112px);
          position: absolute;
          top: -22px;
          z-index: 0;
        }

        .facilities-title p {
          color: #fff;
          font-size: clamp(13px, 1vw, 17px);
          font-weight: 700;
          margin-top: 10px;
          position: relative;
          z-index: 1;
        }

        .facilities-title h2 {
          position: relative;
          z-index: 1;
        }

        .facilities-track {
          display: grid;
          grid-template-columns: repeat(5, minmax(170px, 1fr));
          gap: clamp(10px, 1.1vw, 18px);
          margin: 0 auto;
          width: 100%;
          max-width: none;
          padding: 0 clamp(22px, 6vw, 112px);
        }

        .facility-slide {
          aspect-ratio: 1.42 / 1;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .facility-slide img {
          filter: brightness(0.55);
          height: 100%;
          object-fit: cover;
          width: 100%;
        }

        .facility-slide span {
          bottom: 14px;
          color: #fff;
          font-size: clamp(15px, 1.2vw, 22px);
          font-weight: 900;
          left: 16px;
          position: absolute;
        }

        .facility-slide.is-active {
          transform: translateY(28px);
        }

        .facility-slide.is-active img {
          filter: brightness(0.42);
        }

        .why-us {
          background: #f1f2f5;
          padding: clamp(58px, 7vw, 92px) clamp(22px, 6vw, 112px) clamp(64px, 7vw, 96px);
          text-align: center;
        }

        .why-kicker {
          color: #0a1185;
          font-size: clamp(14px, 1vw, 18px);
          font-weight: 900;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .why-us h2 {
          color: #ff7a00;
          font-size: clamp(22px, 2.6vw, 38px);
          font-weight: 900;
          margin-bottom: 30px;
        }

        .why-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          margin: 0 auto;
          width: min(100%, 1120px);
          max-width: none;
        }

        .why-card {
          background: #d9d9d9;
          border-radius: 8px;
          min-height: clamp(156px, 12vw, 210px);
          padding: clamp(18px, 1.8vw, 28px);
          text-align: left;
        }

        .why-card span {
          background: #0a1185;
          border: 0;
          height: 34px;
          margin-bottom: 16px;
          width: 34px;
        }

        .why-card h3 {
          color: #0a1185;
          font-size: clamp(13px, 1vw, 17px);
          font-weight: 900;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .why-card p {
          color: #555;
          font-size: clamp(12px, 0.95vw, 16px);
          line-height: 1.45;
        }

        .landing-membership {
          background: #0a1185;
          color: #fff;
          padding: clamp(56px, 7vw, 92px) clamp(22px, 6vw, 112px);
          text-align: center;
        }

        .membership-header {
          margin: 0 auto 28px;
          width: min(100%, 860px);
        }

        .landing-plan-preview {
          background: #0a1185;
          color: #fff;
          padding: clamp(56px, 7vw, 92px) clamp(22px, 6vw, 112px);
          text-align: center;
        }

        .plan-preview-header {
          margin: 0 auto 28px;
          width: min(100%, 860px);
        }

        .plan-preview-header h2,
        .membership-header h2,
        .membership-steps h2,
        .membership-benefits h2,
        .membership-faq h2,
        .membership-cta h2 {
          color: #fff;
          font-family: 'Anton', sans-serif;
          font-size: clamp(30px, 4.4vw, 58px);
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1;
          text-transform: uppercase;
        }

        .plan-preview-header p,
        .membership-header p,
        .membership-cta p {
          color: #dfe4ff;
          font-size: clamp(13px, 1vw, 16px);
          font-weight: 700;
          margin-top: 8px;
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
          color: #0a1185;
          display: flex;
          flex-direction: column;
          min-height: 300px;
          padding: clamp(18px, 2vw, 28px);
          text-align: left;
        }

        .membership-plan.is-featured {
          background: #101010;
          border-color: #ff7a00;
          color: #fff;
          transform: translateY(-16px);
        }

        .plan-kicker {
          color: #ff7a00;
          font-size: clamp(13px, 1vw, 16px);
          font-weight: 900;
          text-transform: uppercase;
        }

        .membership-plan h3 {
          font-size: clamp(26px, 3vw, 42px);
          font-weight: 900;
          margin-top: 6px;
        }

        .membership-plan h2 {
          color: inherit;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(26px, 3vw, 42px);
          font-weight: 900;
          margin-top: 6px;
          text-transform: none;
        }

        .membership-plan span {
          color: inherit;
          font-size: 13px;
          font-weight: 800;
          opacity: 0.78;
        }

        .membership-plan ul {
          display: grid;
          gap: 10px;
          list-style: none;
          margin: 22px 0;
        }

        .membership-plan li {
          color: inherit;
          font-size: clamp(12px, 0.95vw, 15px);
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
          font-size: clamp(12px, 0.9vw, 15px);
          font-weight: 900;
          justify-content: center;
          margin-top: auto;
          min-height: 42px;
          padding: 0 18px;
          text-decoration: none;
        }

        .membership-steps,
        .membership-benefits,
        .membership-faq,
        .membership-cta {
          margin: clamp(48px, 6vw, 76px) auto 0;
          width: min(100%, 1120px);
        }

        .steps-grid,
        .benefit-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          margin-top: 24px;
        }

        .step-card {
          color: #fff;
          min-height: 132px;
          padding: 8px;
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
          font-size: clamp(12px, 0.9vw, 14px);
          line-height: 1.45;
        }

        .benefit-card {
          background: #ffe6bd;
          border-radius: 8px;
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
          color: #0a1185;
          text-align: left;
        }

        .faq-list summary {
          cursor: pointer;
          font-size: clamp(12px, 0.95vw, 15px);
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
          color: #0a1185;
          padding: clamp(24px, 3vw, 36px);
          width: min(100%, 820px);
        }

        .membership-cta h2 {
          color: #0a1185;
          font-size: clamp(24px, 3vw, 42px);
        }

        .membership-cta p {
          color: #454b7c;
        }

        .membership-cta a {
          margin-top: 18px;
        }

        .landing-footer {
          background: #0a1185;
          color: #fff;
          display: grid;
          gap: 40px;
          grid-template-columns: minmax(220px, 1fr) minmax(0, 2fr);
          padding: clamp(48px, 6vw, 78px) clamp(22px, 6vw, 112px);
        }

        .footer-brand {
          align-items: flex-start;
          display: flex;
          gap: 14px;
        }

        .footer-brand img {
          height: 42px;
          width: 42px;
        }

        .landing-footer strong {
          color: #ff8a00;
          font-size: clamp(17px, 1.3vw, 24px);
          font-weight: 900;
        }

        .landing-footer p {
          color: #fff;
          margin-top: 6px;
          font-size: clamp(13px, 1vw, 16px);
          line-height: 1.5;
        }

        .footer-columns {
          display: grid;
          gap: 28px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .footer-columns h3 {
          color: #fff;
          font-size: clamp(12px, 0.9vw, 15px);
          font-weight: 900;
          margin-bottom: 14px;
          text-transform: uppercase;
        }

        .footer-columns a {
          color: #dfe4ff;
          display: block;
          font-size: clamp(12px, 0.85vw, 14px);
          font-weight: 700;
          margin-bottom: 9px;
          text-decoration: none;
        }

        @media (max-width: 860px) {
          .landing-home {
            min-height: 100vh;
            min-height: 100dvh;
          }

          .explore-grid,
          .why-grid,
          .info-grid,
          .membership-plans,
          .steps-grid,
          .benefit-grid,
          .landing-footer {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .membership-plan.is-featured {
            transform: none;
          }

          .facilities-track {
            grid-template-columns: repeat(3, minmax(180px, 1fr));
          }
        }

        @media (max-width: 620px) {
          .landing-home {
            padding-top: 18px;
            min-height: 100vh;
            min-height: 100dvh;
          }

          .landing-nav,
          .landing-links,
          .landing-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .explore-grid,
          .why-grid,
          .info-grid,
          .membership-plans,
          .steps-grid,
          .benefit-grid,
          .footer-columns,
          .landing-footer {
            grid-template-columns: 1fr;
          }

          .landing-hero {
            align-items: center;
            padding-top: 52px;
            padding-bottom: 86px;
          }

          .landing-hero-copy {
            max-width: 100%;
          }

          .landing-hero h1 {
            font-size: clamp(48px, 15vw, 78px);
          }

          .landing-hero-copy p {
            font-size: 15px;
          }

          .facilities-track {
            display: flex;
            overflow-x: auto;
          }

          .facility-slide {
            min-width: 220px;
          }
        }
      `}</style>
      <Home />
      <MembershipPlanCards compact />
      <Explore />
      <Facilities />
      <Footer />
    </main>
  );
}
