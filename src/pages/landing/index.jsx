import { useEffect, useState } from "react";
import Home from "../../components/landing/home/Home";
import Explore from "../../components/landing/explore/Explore";
import MembershipPlanCards from "../../components/landing/membership/MembershipPlanCards";
import Facilities from "../../components/landing/facilities/Facilities";
import Footer from "../../components/landing/footer/Footer";
import api from "../../components/auth/hooks/authApi";
import { authMembershipPlans, mapCatalogsToMembershipPlans } from "../auth/membership/hooks/authPlans";

export default function LandingPage({ scrollToExplore = false }) {
  const [plans, setPlans] = useState(authMembershipPlans);

  useEffect(() => {
    const html = document.documentElement;
    const root = document.getElementById("root");
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootHeight = root?.style.height || "";
    const previousRootOverflow = root?.style.overflow || "";

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (root) {
      root.style.height = "100dvh";
      root.style.overflow = "hidden";
    }

    return () => {
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      if (root) {
        root.style.height = previousRootHeight;
        root.style.overflow = previousRootOverflow;
      }
    };
  }, []);

  useEffect(() => {
    const motionItems = Array.from(document.querySelectorAll(".landing-motion"));
    if (motionItems.length === 0) return undefined;

    if (!("IntersectionObserver" in window)) {
      motionItems.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
    );

    motionItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!scrollToExplore) return;

    const exploreSection = document.getElementById("explore");
    exploreSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollToExplore]);

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
          height: 100vh;
          height: 100dvh;
          width: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          background: #f1f2f5;
          color: #0a1185;
          font-family: 'DM Sans', sans-serif;
        }

        .landing-motion {
          opacity: 0;
          transform: perspective(1200px) translate3d(0, 52px, -90px) scale(.965);
          transform-origin: center top;
          transition:
            opacity .78s cubic-bezier(.22, 1, .36, 1),
            transform .78s cubic-bezier(.22, 1, .36, 1);
          will-change: opacity, transform;
        }

        .landing-motion.is-visible {
          opacity: 1;
          transform: perspective(1200px) translate3d(0, 0, 0) scale(1);
        }

        .landing-motion-delay-1 {
          transition-delay: .08s;
        }

        .landing-motion-delay-2 {
          transition-delay: .16s;
        }

        .landing-motion-delay-3 {
          transition-delay: .24s;
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

        .landing-home .landing-nav {
          animation: landingNavEnter .72s cubic-bezier(.22, 1, .36, 1) both;
        }

        .landing-home .landing-hero-copy {
          animation: landingDepthEnter .9s cubic-bezier(.22, 1, .36, 1) .08s both;
        }

        .landing-home .explore-ticker {
          animation: landingTickerEnter .74s cubic-bezier(.22, 1, .36, 1) .2s both;
        }

        @keyframes landingDepthEnter {
          from {
            opacity: 0;
            transform: perspective(1200px) translate3d(0, 42px, -140px) scale(.94);
          }
          to {
            opacity: 1;
            transform: perspective(1200px) translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes landingNavEnter {
          from {
            opacity: 0;
            transform: translateY(-18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes landingTickerEnter {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          animation: exploreTickerRight 4s linear infinite;
          will-change: transform;
        }

        .explore-ticker span::before {
          content: '';
          display: block;
          width: 11px;
          height: 11px;
          background: #ffb000;
          border-radius: 50%;
        }

        @keyframes exploreTickerRight {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-motion,
          .landing-motion.is-visible,
          .landing-home .landing-nav,
          .landing-home .landing-hero-copy,
          .landing-home .explore-ticker {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
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
          gap: 24px;
          min-height: clamp(98px, 8vw, 128px);
          padding-left: 18px;
        }

        .info-item span,
        .why-card span {
          align-items: center;
          border: 3px solid #ffd45f;
          border-radius: 50%;
          color: #ffd45f;
          display: inline-flex;
          flex: 0 0 auto;
          height: clamp(76px, 6.5vw, 104px);
          justify-content: center;
          width: clamp(76px, 6.5vw, 104px);
        }

        .info-item span svg {
          height: 76%;
          width: 76%;
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
          padding: clamp(48px, 5vw, 72px) 0 clamp(76px, 7vw, 104px);
        }

        .facilities-title {
          width: min(100%, 1320px);
          max-width: none;
          margin: 0 auto clamp(32px, 4vw, 54px);
          min-height: clamp(220px, 25vw, 330px);
          padding: clamp(30px, 4vw, 62px) clamp(22px, 6vw, 112px) 0;
          position: relative;
        }

        .facilities-title::before {
          background: #ffd45f;
          content: '';
          height: clamp(170px, 19vw, 260px);
          left: clamp(22px, 6vw, 112px);
          position: absolute;
          top: clamp(28px, 3.6vw, 56px);
          width: 3px;
          z-index: 2;
        }

        .facilities-title h2 {
          color: #ffd45f;
          font-family: 'Anton', sans-serif;
          font-size: clamp(58px, 7.8vw, 118px);
          font-weight: 400;
          letter-spacing: 0;
          line-height: 0.95;
          padding-left: clamp(34px, 4.8vw, 76px);
          text-transform: uppercase;
        }

        .facilities-title h2::after {
          color: rgba(255, 255, 255, 0.22);
          content: 'FACILITIES';
          font-size: clamp(104px, 18vw, 250px);
          left: calc(clamp(22px, 6vw, 112px) + clamp(48px, 4.2vw, 70px));
          line-height: 0.76;
          position: absolute;
          top: clamp(18px, 2.6vw, 42px);
          z-index: 0;
        }

        .facilities-title p {
          color: #ffd45f;
          font-size: clamp(22px, 2.5vw, 40px);
          font-weight: 600;
          margin-top: clamp(42px, 5vw, 76px);
          padding-left: clamp(34px, 4.8vw, 76px);
          position: relative;
          z-index: 1;
        }

        .facilities-title h2 {
          position: relative;
          z-index: 1;
        }

        .facilities-track {
          align-items: center;
          display: flex;
          justify-content: center;
          margin: 0 auto;
          min-height: clamp(210px, 24vw, 340px);
          overflow: visible;
          position: relative;
          width: 100%;
          max-width: none;
          padding: 0;
        }

        .facility-slide {
          aspect-ratio: 1.58 / 1;
          border-radius: 9px;
          flex: 0 0 clamp(230px, 27vw, 420px);
          margin: 0 clamp(-82px, -7vw, -32px);
          overflow: hidden;
          position: relative;
          transition:
            flex-basis 260ms ease,
            transform 260ms ease,
            filter 260ms ease,
            opacity 260ms ease;
          z-index: 1;
        }

        .facility-slide img {
          filter: brightness(0.54);
          height: 100%;
          object-fit: cover;
          width: 100%;
        }

        .facility-slide span {
          bottom: clamp(16px, 2vw, 26px);
          color: #fff;
          font-size: clamp(18px, 2vw, 32px);
          font-weight: 900;
          left: 50%;
          position: absolute;
          text-align: center;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);
          transform: translateX(-50%);
          white-space: nowrap;
        }

        .facility-slide.is-active {
          flex-basis: clamp(350px, 38vw, 620px);
          transform: translateY(-28px);
          z-index: 3;
        }

        .facility-slide.is-active img {
          filter: brightness(0.42);
        }

        .facility-nav {
          align-items: center;
          background: rgba(255, 255, 255, 0.14);
          border: 3px solid #fff;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          display: inline-flex;
          height: clamp(34px, 3.8vw, 50px);
          justify-content: center;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: clamp(34px, 3.8vw, 50px);
          z-index: 4;
        }

        .facility-nav:hover {
          background: rgba(255, 255, 255, 0.24);
        }

        .facility-nav svg {
          height: 72%;
          width: 72%;
        }

        .facility-nav.is-prev {
          animation: facilityArrowLeft 1.35s ease-in-out infinite;
          left: clamp(16px, 2.2vw, 36px);
        }

        .facility-nav.is-next {
          animation: facilityArrowRight 1.35s ease-in-out infinite;
          right: clamp(16px, 2.2vw, 36px);
        }

        @keyframes facilityArrowLeft {
          0%,
          100% {
            transform: translateY(-50%) translateX(0);
          }

          50% {
            transform: translateY(-50%) translateX(-8px);
          }
        }

        @keyframes facilityArrowRight {
          0%,
          100% {
            transform: translateY(-50%) translateX(0);
          }

          50% {
            transform: translateY(-50%) translateX(8px);
          }
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
          border-radius: 6px;
          color: #ffd45f;
          height: 68px;
          margin-bottom: 16px;
          width: 68px;
        }

        .why-card span svg {
          height: 42px;
          width: 42px;
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
          cursor: pointer;
          display: flex;
          flex-direction: column;
          min-height: 300px;
          padding: clamp(18px, 2vw, 28px);
          text-align: left;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          will-change: transform;
        }

        .membership-plan.is-featured {
          background: #fff;
          border-color: transparent;
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
          gap: 0;
          padding: 0;
        }

        .footer-main {
          display: grid;
          gap: clamp(40px, 7vw, 92px);
          grid-template-columns: minmax(250px, .9fr) minmax(0, 2.2fr);
          padding: 70px clamp(28px, 7vw, 128px) 64px;
        }

        .footer-brand {
          align-items: flex-start;
          display: grid;
          gap: 22px;
        }

        .footer-logo-row {
          align-items: center;
          display: flex;
          gap: 14px;
        }

        .footer-brand img {
          height: 48px;
          object-fit: contain;
          width: 48px;
        }

        .footer-logo-row strong {
          color: #ff8a00;
          font-size: 30px;
          font-weight: 900;
        }

        .footer-brand p {
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.28;
          margin: 0;
          max-width: 240px;
        }

        .footer-social {
          display: flex;
          gap: 14px;
        }

        .footer-social a {
          align-items: center;
          background: #ffdd82;
          border-radius: 50%;
          color: #0a1185;
          display: inline-flex;
          height: 34px;
          justify-content: center;
          text-decoration: none;
          width: 34px;
        }

        .footer-social svg {
          height: 21px;
          width: 21px;
        }

        .footer-columns {
          display: grid;
          gap: clamp(34px, 6vw, 86px);
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .footer-columns h3 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0;
          margin: 0 0 28px;
          text-transform: uppercase;
        }

        .footer-columns a {
          color: #ffffff;
          display: block;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 16px;
          text-decoration: none;
          text-transform: uppercase;
        }

        .footer-contact p {
          align-items: flex-start;
          color: #ffffff;
          display: grid;
          font-size: 15px;
          font-weight: 600;
          gap: 20px;
          grid-template-columns: 22px minmax(0, 1fr);
          line-height: 1.25;
          margin: 0 0 18px;
          text-transform: uppercase;
        }

        .footer-contact svg {
          color: #ffffff;
          height: 22px;
          width: 22px;
        }

        .footer-contact p:not(:first-of-type) {
          text-transform: none;
        }

        .footer-bottom {
          align-items: center;
          border-top: 1px solid rgba(255,255,255,.16);
          display: flex;
          gap: 24px;
          justify-content: space-between;
          min-height: 68px;
          padding: 0 clamp(28px, 7vw, 128px);
        }

        .footer-bottom p {
          color: rgba(255,255,255,.72);
          font-size: 12px;
          font-weight: 500;
          margin: 0;
        }

        .footer-bottom div {
          display: flex;
          gap: 28px;
        }

        .footer-bottom a {
          color: rgba(255,255,255,.78);
          font-size: 12px;
          font-weight: 500;
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
          .footer-main {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .membership-plan.is-featured {
            transform: none;
          }

          .facility-slide {
            margin: 0 -28px;
          }
        }

        @media (max-width: 620px) {
          .landing-home {
            padding-top: 18px;
            min-height: 100vh;
            min-height: 100dvh;
          }

          .landing-nav,
          .landing-links {
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
          .footer-main {
            grid-template-columns: 1fr;
          }

          .footer-main {
            padding: 46px 24px;
          }

          .footer-bottom {
            align-items: flex-start;
            flex-direction: column;
            padding: 20px 24px;
          }

          .footer-bottom div {
            flex-wrap: wrap;
            gap: 14px 22px;
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
            justify-content: flex-start;
            min-height: 230px;
            padding: 0 22px 8px;
            scroll-snap-type: x mandatory;
          }

          .facility-slide {
            flex: 0 0 230px;
            margin: 0 10px 0 0;
            min-width: 230px;
            scroll-snap-align: center;
          }

          .facility-slide.is-active {
            flex-basis: 260px;
            transform: none;
          }

          .facility-nav {
            display: none;
          }

          .facilities-title {
            min-height: 220px;
          }

          .facilities-title p {
            margin-top: 32px;
          }
        }
      `}</style>
      <Home />
      <div className="landing-motion landing-motion-delay-1">
        <MembershipPlanCards compact plans={plans} />
      </div>
      <div className="landing-motion landing-motion-delay-1">
        <Explore />
      </div>
      <div className="landing-motion landing-motion-delay-2">
        <Facilities />
      </div>
      <div className="landing-motion landing-motion-delay-3">
        <Footer />
      </div>
    </main>
  );
}
