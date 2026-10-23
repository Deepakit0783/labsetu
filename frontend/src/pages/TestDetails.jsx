
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FlaskConical,
  Clock3,
  House,
  ShieldCheck,
  Info,
  ArrowRight,
} from "lucide-react";

export default function TestDetails() {
  const { id } = useParams();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <main className="inner-page">
      <section className="inner-page-hero">
        <div className="page-container">
          <Link to="/tests" className="text-link">
            <ArrowLeft size={17} /> Back to tests
          </Link>

          <div className="test-detail-heading">
            <span className="test-detail-icon">
              <FlaskConical size={30} />
            </span>

            <div>
              <span className="section-kicker">TEST INFORMATION</span>
              <h1>Diagnostic test details</h1>
              <p>Test reference: {id || "Not selected"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container detail-page-grid">
        <div className="detail-main-card">
          <h2>Before you book</h2>

          <p>
            Test requirements depend on the specific investigation and
            laboratory. Confirm preparation instructions with the selected
            lab or a qualified healthcare professional.
          </p>

          <div className="detail-info-list">
            <div>
              <span><Clock3 size={20} /></span>
              <div>
                <strong>Report turnaround</strong>
                <p>Confirm with the selected laboratory before booking.</p>
              </div>
            </div>

            <div>
              <span><House size={20} /></span>
              <div>
                <strong>Home sample collection</strong>
                <p>
                  Available only for supported PIN codes and time slots.
                </p>
              </div>
            </div>

            <div>
              <span><ShieldCheck size={20} /></span>
              <div>
                <strong>Lab selection</strong>
                <p>Choose from verified labs with approved listings.</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-outline-brand mt-3"
            onClick={() => setShowInfo((current) => !current)}
          >
            <Info size={17} /> Preparation information
          </button>

          {showInfo && (
            <div className="detail-notice">
              Do not assume fasting or stop any medicine without appropriate
              medical advice. Follow the selected laboratory's instructions
              for your specific test.
            </div>
          )}
        </div>

        <aside className="detail-book-card">
          <span className="section-kicker">NEXT STEP</span>
          <h2>Book your diagnostic test</h2>

          <p>
            Continue to select your test, preferred lab, collection date,
            address and payment preference.
          </p>

          <Link
            to={`/booking?test=${encodeURIComponent(id || "")}`}
            className="btn btn-brand w-100"
          >
            Book This Test <ArrowRight size={17} />
          </Link>

          <Link
            to={`/labs?test=${encodeURIComponent(id || "")}`}
            className="btn-outline-brand mt-2 w-100"
          >
            Compare labs <ArrowRight size={17} />
          </Link>

          <small>Lab availability and booking confirmation may vary.</small>
        </aside>
      </section>
    </main>
  );
}
