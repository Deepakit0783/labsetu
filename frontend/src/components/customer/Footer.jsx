import { Link } from "react-router-dom";
import { HeartPulse, MapPin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container">
        <div className="footer-grid">
          <div className="footer-brand-column">
            <Link to="/" className="brand footer-brand">
              <span className="brand-icon"><HeartPulse size={25} /></span>
              <span className="brand-text">
                <strong>Lab<span>Setu</span></strong>
                <small>Aapki Sehat, Hamari Priority</small>
              </span>
            </Link>
            <p>
              A simpler way to explore diagnostic tests and home collection
              options in Sitamarhi, Bihar.
            </p>
            <span className="footer-location">
              <MapPin size={16} /> Sitamarhi, Bihar, India
            </span>
          </div>

          <div className="footer-column">
            <h3>Explore</h3>
            <Link to="/tests">Diagnostic tests</Link>
            <Link to="/labs">Compare labs</Link>
            <a href="/#how-it-works">How it works</a>
          </div>

          <div className="footer-column">
            <h3>Your account</h3>
            <Link to="/login">Login</Link>
            <Link to="/register">Create account</Link>
            <Link to="/bookings">My bookings</Link>
            <Link to="/reports">My reports</Link>
          </div>

          <div className="footer-column">
            <h3>Important</h3>
            <p>
              Medical reports and diagnosis should be handled by qualified
              healthcare professionals.
            </p>
            <p>
              Partner listings and service availability will be shown only
              after verification.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} LabSetu</span>
          <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Back to top <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}