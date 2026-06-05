import { Link } from "react-router";
import heroImage from "../../../assets/auth/signup-gym.jpg";
import vocafitLogo from "../../../assets/auth/vocafit-logo.png";

export default function Home() {
  return (
    <section
      className="landing-home"
      id="home"
      style={{ "--hero-image": `url(${heroImage})` }}
    >
      <nav className="landing-nav" aria-label="Navigasi utama">
        <Link className="landing-brand" to="/">
          <img src={vocafitLogo} alt="Vocafit" />
          <span>Vocafit</span>
        </Link>
        <div className="landing-links">
          <a href="#home">Home</a>
          <Link to="/explore">Explore</Link>
          <a href="#facilities">Facilities</a>
          <Link to="/sign-in">Sign In</Link>
          <Link className="nav-join" to="/membership">
            Join Us
          </Link>
        </div>
      </nav>

      <div className="landing-hero">
        <div className="landing-hero-copy">
          <h1>Everyday is a good day to workout</h1>
          <p>
            Balance your mind, build your body.
          </p>
          <div className="landing-actions">
            <Link className="landing-primary-btn" to="/sign-up">
              Join Us
            </Link>
          </div>
        </div>
      </div>

      <div className="explore-ticker" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index}>Explore</span>
        ))}
      </div>
    </section>
  );
}
