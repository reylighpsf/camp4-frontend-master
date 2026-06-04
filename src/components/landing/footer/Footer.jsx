import { Link } from "react-router";
import vocafitLogo from "../../../assets/auth/vocafit-logo.png";

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-brand">
        <img src={vocafitLogo} alt="Vocafit" />
        <div>
          <strong>Vocafit</strong>
          <p>Fitness club, trainer, and member management platform.</p>
        </div>
      </div>
      <div className="footer-columns">
        <div>
          <h3>Navigation</h3>
          <a href="#home">Home</a>
          <a href="#explore">Explore</a>
          <Link to="/membership">Membership</Link>
          <a href="#facilities">Facilities</a>
        </div>
        <div>
          <h3>Program</h3>
          <a href="#facilities">Strength Area</a>
          <a href="#facilities">Cardio Area</a>
          <a href="#facilities">Trainer Schedule</a>
        </div>
        <div>
          <h3>Contact</h3>
          <Link to="/sign-in">Member Login</Link>
          <Link to="/sign-up">Join Us</Link>
        </div>
      </div>
    </footer>
  );
}
