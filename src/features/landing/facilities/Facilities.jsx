import { useMemo, useState } from "react";
import bodyScanImage from "../../../assets/facilities/body-scan-area.jpg";
import cardioImage from "../../../assets/facilities/cardio-area.jpg";
import functionalImage from "../../../assets/facilities/functional-area.jpg";
import gymImage from "../../../assets/auth/signup-gym.jpg";
import spinStudioImage from "../../../assets/facilities/spin-studio.jpg";
import strengthImage from "../../../assets/facilities/strength-zone.jpg";

const facilities = [
  { title: "Cardio Area", image: cardioImage },
  { title: "Functional Area", image: functionalImage },
  { title: "Spin Studio", image: spinStudioImage },
  { title: "Strength Zone", image: strengthImage },
  { title: "Body Scan", image: bodyScanImage },
];

const info = [
  ["Location", "Gedung K1, Fakultas Vokasi UNESA", "pin"],
  ["Opening Hours", "Mon - Sun: 06:00 - 22:00", "clock"],
  ["Membership", "From Rp 100.000/month", "membership"],
  ["Trainers", "10+ Certified Trainers", "trainers"],
];

const whyItems = [
  ["Professional Trainers", "Train smarter with certified coaches who know exactly how to push you to your best.", "trainer"],
  ["Complete Equipment", "Top-tier machines and free weights, always maintained for your peak performance.", "equipment"],
  ["Varied Class", "From high-intensity workouts to mindful sessions, find the class that fits your vibe.", "class"],
  ["Safe Environment", "Work out with peace of mind in a secure, clean, and fully equipped space.", "shield"],
];

export default function Facilities() {
  const [activeFacilityIndex, setActiveFacilityIndex] = useState(2);

  const visibleFacilities = useMemo(
    () =>
      [-2, -1, 0, 1, 2].map((offset) => {
        const index = (activeFacilityIndex + offset + facilities.length) % facilities.length;
        return facilities[index];
      }),
    [activeFacilityIndex],
  );

  const showPreviousFacility = () => {
    setActiveFacilityIndex((currentIndex) => (currentIndex - 1 + facilities.length) % facilities.length);
  };

  const showNextFacility = () => {
    setActiveFacilityIndex((currentIndex) => (currentIndex + 1) % facilities.length);
  };

  return (
    <>
      <section
        className="landing-info"
        style={{ "--info-image": `url(${gymImage})` }}
      >
        <div className="info-grid">
          {info.map(([title, text, icon]) => (
            <article className="info-item" key={title}>
              <span aria-hidden="true">
                <FacilityIcon name={icon} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-facilities" id="facilities">
        <div className="facilities-title">
          <h2>Our Facilities</h2>
          <p>"Your fitness journey starts here."</p>
        </div>
        <div className="facilities-track">
          <button className="facility-nav is-prev" type="button" aria-label="Previous facility" onClick={showPreviousFacility}>
            <ChevronIcon direction="left" />
          </button>
          {visibleFacilities.map((facility, index) => (
            <article
              className={`facility-slide ${index === 2 ? "is-active" : ""}`}
              key={`${facility.title}-${index}`}
            >
              <img src={facility.image} alt={facility.title} />
              <span>{facility.title}</span>
            </article>
          ))}
          <button className="facility-nav is-next" type="button" aria-label="Next facility" onClick={showNextFacility}>
            <ChevronIcon direction="right" />
          </button>
        </div>
      </section>

      <section className="why-us">
        <p className="why-kicker">Why Us</p>
        <h2>Built for Champions, Open to Everyone</h2>
        <div className="why-grid">
          {whyItems.map(([title, text, icon]) => (
            <article className="why-card" key={title}>
              <span aria-hidden="true">
                <FacilityIcon name={icon} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function ChevronIcon({ direction }) {
  return (
    <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24">
      {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

function FacilityIcon({ name }) {
  const commonProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "2.4",
    viewBox: "0 0 24 24",
  };

  const icons = {
    pin: (
      <svg {...commonProps}>
        <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
    ),
    clock: (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.2 2.2" />
      </svg>
    ),
    membership: (
      <svg {...commonProps}>
        <path d="M12 3v18" />
        <path d="M17 7.5c-.8-1.3-2.2-2-4.2-2H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-3c-2 0-3.5-.8-4.4-2.2" />
      </svg>
    ),
    trainers: (
      <svg {...commonProps}>
        <circle cx="8" cy="8" r="3" />
        <path d="M3.5 20a4.5 4.5 0 0 1 9 0" />
        <path d="M17 4.5a3 3 0 0 1 0 6" />
        <path d="M15.5 15.2A4.5 4.5 0 0 1 20.5 20" />
      </svg>
    ),
    trainer: (
      <svg {...commonProps}>
        <path d="M7 8h10" />
        <path d="M7 12h10" />
        <path d="M8 16h5" />
        <rect x="5" y="4" width="14" height="16" rx="2" />
      </svg>
    ),
    equipment: (
      <svg {...commonProps}>
        <path d="M6 8v8" />
        <path d="M18 8v8" />
        <path d="M3 10v4" />
        <path d="M21 10v4" />
        <path d="M6 12h12" />
      </svg>
    ),
    class: (
      <svg {...commonProps}>
        <path d="M12 3a9 9 0 1 0 9 9" />
        <path d="M12 7v5l4 2" />
      </svg>
    ),
    shield: (
      <svg {...commonProps}>
        <path d="M12 21s7-3.5 7-9V5l-7-2-7 2v7c0 5.5 7 9 7 9Z" />
      </svg>
    ),
  };

  return icons[name] || null;
}
