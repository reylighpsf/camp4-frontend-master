import gymImage from "../../../assets/auth/signup-gym.jpg";

const facilities = [
  "Cardio Area",
  "Functional Area",
  "Spin Studio",
  "Strength Zone",
  "Body Scan",
];

const info = [
  ["Location", "Gedung R1, Fakultas Vokasi UNSA"],
  ["Opening Hours", "Mon - Sun: 08:00 - 22:00"],
  ["Membership", "From Rp 100.000/month"],
  ["Trainers", "10+ Certified Trainers"],
];

export default function Facilities() {
  return (
    <>
      <section
        className="landing-info"
        style={{ "--info-image": `url(${gymImage})` }}
      >
        <div className="info-grid">
          {info.map(([title, text]) => (
            <article className="info-item" key={title}>
              <span aria-hidden="true" />
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
          {facilities.map((facility, index) => (
            <article
              className={`facility-slide ${index === 2 ? "is-active" : ""}`}
              key={facility}
            >
              <img src={gymImage} alt={facility} />
              <span>{facility}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="why-us">
        <p className="why-kicker">Why Us</p>
        <h2>Built for Champions, Open to Everyone</h2>
        <div className="why-grid">
          {["Premium Trainers", "Daily Support", "Smart Access", "Gym Management"].map(
            (item) => (
              <article className="why-card" key={item}>
                <span aria-hidden="true" />
                <h3>{item}</h3>
                <p>Reliable fitness support for members and operators.</p>
              </article>
            ),
          )}
        </div>
      </section>
    </>
  );
}
