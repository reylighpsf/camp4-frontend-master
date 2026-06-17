import { Link } from "react-router";
import vocafitLogo from "../../../assets/auth/vocafit-logo.png";

export default function Footer() {
  return (
    <footer className="landing-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo-row">
            <img src={vocafitLogo} alt="Vocafit" />
            <strong>Vocafit</strong>
          </div>
          <p>
            Premium fitness center committed to helping you achieve your best
            physical self.
          </p>
          <div className="footer-social" aria-label="Social media">
            <a href="https://instagram.com" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://facebook.com" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="https://twitter.com" aria-label="Twitter">
              <TwitterIcon />
            </a>
            <a href="https://youtube.com" aria-label="YouTube">
              <YoutubeIcon />
            </a>
          </div>
        </div>

        <div className="footer-columns">
          <div>
            <h3>Navigation</h3>
            <a href="#home">Home</a>
            <a href="#explore">Explore</a>
            <a href="#facilities">Facilities</a>
            <Link to="/membership">Membership</Link>
            <a href="#trainers">Trainers</a>
          </div>
          <div>
            <h3>Program</h3>
            <a href="#facilities">Spin Studio</a>
            <a href="#facilities">Functional Area</a>
            <a href="#facilities">Cardio Deck</a>
            <a href="#facilities">Strength Zone</a>
            <a href="#facilities">Mind & Body Studio</a>
          </div>
          <div className="footer-contact">
            <h3>Contact</h3>
            <p>
              <LocationIcon />
              <span>Gedung K1,<br />Fakultas Vokasi<br />Unesa</span>
            </p>
            <p>
              <PhoneIcon />
              <span>+62 21 1234-5678</span>
            </p>
            <p>
              <MailIcon />
              <span>hello@vocafit.id</span>
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Vocafit. All rights reserved.</p>
        <div>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#cookie">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.3" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.5" cy="7.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 8.5h2V5h-2.5C10.8 5 9 6.8 9 9.5V12H7v3.5h2V20h4v-4.5h2.5L16 12h-3V9.7c0-.8.4-1.2 1-1.2Z" fill="currentColor" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 8.1v.5c0 5.1-3.9 10.9-10.9 10.9-2.1 0-4.1-.6-5.8-1.7h.9c1.8 0 3.4-.6 4.7-1.6-1.7 0-3.1-1.1-3.6-2.7.2 0 .5.1.7.1.3 0 .7 0 1-.1-1.7-.4-3-1.9-3-3.7.5.3 1.1.5 1.7.5-1-.7-1.7-1.8-1.7-3.1 0-.7.2-1.3.5-1.9 1.9 2.3 4.7 3.8 7.8 4-.1-.3-.1-.6-.1-.9 0-2.2 1.8-3.9 3.9-3.9 1.1 0 2.1.5 2.8 1.2.9-.2 1.7-.5 2.4-.9-.3.9-.9 1.6-1.6 2.1.8-.1 1.5-.3 2.1-.6-.5.7-1.1 1.3-1.8 1.8Z" fill="currentColor" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="7" width="16" height="10" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="m11 10 4 2-4 2v-4Z" fill="currentColor" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 5c.5 4.6 2.8 8.2 7 11l2.3-2.1 2.7 1.8c-.4 2.2-1.7 3.3-3.7 3.3C10 19 5 14 5 7.7 5 5.7 6.1 4.4 8.3 4L10 6.7 8 5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
