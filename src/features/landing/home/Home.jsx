import { useState } from "react";
import { Link } from "react-router";
import heroImage from "../../../assets/auth/signup-gym.jpg";
import vocafitLogo from "../../../assets/auth/vocafit-logo.png";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

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
        <button
          aria-controls="landing-menu"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          className={`landing-menu-toggle ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`landing-links ${menuOpen ? "is-open" : ""}`} id="landing-menu">
          <a href="#home" onClick={closeMenu}>Home</a>
          <Link to="/explore" onClick={closeMenu}>Explore</Link>
          <a href="#facilities" onClick={closeMenu}>Facilities</a>
          <Link to="/sign-in" onClick={closeMenu}>Sign In</Link>
          <Link className="nav-join" to="/membership" onClick={closeMenu}>
            Join Us
          </Link>
        </div>
      </nav>

      <div className="landing-hero">
        <div className="landing-hero-copy" onClick={closeMenu}>
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
