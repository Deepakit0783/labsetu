
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  ShieldCheck,
  FlaskConical,
  Phone,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function Labs() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadLabs() {
      setLoading(true);
      setError("");

      try {
        // Public lab listing endpoint
        const response = await fetch(`${API_URL}/api/labs`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load laboratories.");
        }

        // Supports common API response structures
        const list = Array.isArray(result)
          ? result
          : Array.isArray(result.labs)
            ? result.labs
            : Array.isArray(result.data?.labs)
              ? result.data.labs
              : Array.isArray(result.data)
                ? result.data
                : [];

        setLabs(list.filter((lab) => lab.isActive !== false));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message ||
              "Could not connect to the laboratory service."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadLabs();

    return () => controller.abort();
  }, []);

  return (
    <main className="inner-page">
      <section className="inner-page-hero">
        <div className="page-container">
          <span className="section-kicker">PARTNER LABS</span>
          <h1>Choose your lab with confidence.</h1>
          <p>
            Explore available laboratories and review their location
            and contact details before booking.
          </p>
        </div>
      </section>

      <section className="page-container catalogue-content">
        <div className="lab-info-banner">
          <ShieldCheck size={25} />
          <div>
            <h3>Trust and transparency first</h3>
            <p>
              Check laboratory details before selecting a test.
              Only active laboratories are displayed.
            </p>
          </div>
        </div>

        {loading && (
          <div className="catalog-empty" role="status">
            <RefreshCw size={28} />
            <h2>Loading laboratories...</h2>
            <p>Please wait while we fetch available labs.</p>
          </div>
        )}

        {!loading && error && (
          <div className="catalog-empty" role="alert">
            <span className="empty-icon">
              <FlaskConical size={32} />
            </span>
            <h2>Unable to load laboratories</h2>
            <p>{error}</p>
            <button
              type="button"
              className="btn btn-brand"
              onClick={() => window.location.reload()}
            >
              Try again <RefreshCw size={17} />
            </button>
          </div>
        )}

        {!loading && !error && labs.length === 0 && (
          <div className="catalog-empty">
            <span className="empty-icon">
              <FlaskConical size={32} />
            </span>
            <h2>No active laboratories found</h2>
            <p>
              There are currently no active labs available to display.
              Please check again later.
            </p>
            <Link to="/tests" className="btn btn-brand">
              Explore tests <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {!loading && !error && labs.length > 0 && (
          <>
            <div className="catalogue-heading">
              <div>
                <h2>Available laboratories</h2>
                <p>
                  {labs.length} active laborator
                  {labs.length === 1 ? "y" : "ies"} found
                </p>
              </div>
            </div>

            <div className="catalog-grid">
              {labs.map((lab) => (
                <article
                  className="catalog-card lab-card"
                  key={lab._id}
                >
                  <div className="lab-card-icon">
                    <FlaskConical size={26} />
                  </div>

                  <div className="lab-card-content">
                    <h3>{lab.name || "Laboratory"}</h3>

                    <p className="lab-description">
                      {lab.description ||
                        "Partner laboratory listed on LabSetu."}
                    </p>

                    <p className="lab-detail">
                      <MapPin size={17} />
                      <span>
                        {[
                          lab.address,
                          lab.city,
                          lab.state,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Location not provided"}
                      </span>
                    </p>

                    {(lab.phone || lab.mobile) && (
                      <p className="lab-detail">
                        <Phone size={17} />
                        <span>{lab.phone || lab.mobile}</span>
                      </p>
                    )}

                    <div className="lab-card-footer">
                      <span className="lab-verified">
                        <ShieldCheck size={16} />
                        Active partner
                      </span>

                      <Link
                        to="/tests"
                        className="btn btn-brand"
                      >
                        View tests <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
