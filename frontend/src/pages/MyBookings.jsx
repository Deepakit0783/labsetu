
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  ArrowRight,
  FlaskConical,
  MapPin,
  Clock3,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function formatDate(date) {
  if (!date) return "Date not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date not available";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status) {
  if (!status) return "Pending";

  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBookings(signal) {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to view your bookings.");
      }

      const response = await fetch(`${API_URL}/api/bookings/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `Unable to load bookings (${response.status}).`
        );
      }

      const list = Array.isArray(result.bookings)
        ? result.bookings
        : Array.isArray(result.data?.bookings)
          ? result.data.bookings
          : [];

      setBookings(list);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Unable to load bookings.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    loadBookings(controller.signal);

    return () => controller.abort();
  }, []);

  return (
    <main className="inner-page">
      <section className="inner-page-hero">
        <div className="page-container">
          <span className="section-kicker">CUSTOMER ACCOUNT</span>
          <h1>My bookings</h1>
          <p>View your appointments and collection status.</p>
        </div>
      </section>

      <section className="page-container catalogue-content">
        {loading && (
          <div className="catalog-empty" role="status">
            <RefreshCw size={28} />
            <h2>Loading your bookings...</h2>
            <p>Please wait while we fetch your appointments.</p>
          </div>
        )}

        {!loading && error && (
          <div className="catalog-empty" role="alert">
            <span className="empty-icon">
              <ClipboardList size={32} />
            </span>
            <h2>Unable to load bookings</h2>
            <p>{error}</p>
            <button
              type="button"
              className="btn btn-brand"
              onClick={() => loadBookings()}
            >
              Try again <RefreshCw size={17} />
            </button>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="catalog-empty">
            <span className="empty-icon">
              <CalendarDays size={32} />
            </span>
            <h2>No bookings to display</h2>
            <p>Your appointments will appear here after you book a test.</p>
            <Link to="/tests" className="btn btn-brand">
              Explore tests <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <>
            <div className="catalogue-heading">
              <div>
                <h2>Your appointments</h2>
                <p>
                  {bookings.length} booking
                  {bookings.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <Link to="/tests" className="btn btn-brand">
                Book another test <ArrowRight size={17} />
              </Link>
            </div>

            <div className="booking-list">
              {bookings.map((booking) => (
                <article
                  className="catalog-card booking-card"
                  key={booking._id}
                >
                  <div className="booking-card-header">
                    <div>
                      <span className="section-kicker">
                        BOOKING ID
                      </span>
                      <h3>
                        {booking._id
                          ? booking._id.slice(-8).toUpperCase()
                          : "Booking"}
                      </h3>
                    </div>

                    <span
                      className={`booking-status status-${(
                        booking.bookingStatus || "pending"
                      ).replace(/[^a-z-]/g, "")}`}
                    >
                      {formatStatus(booking.bookingStatus)}
                    </span>
                  </div>

                  <div className="booking-card-details">
                    <p>
                      <strong>Patient:</strong>{" "}
                      {booking.patientName || "Not provided"}
                    </p>

                    <p>
                      <strong>Mobile:</strong>{" "}
                      {booking.mobile || "Not provided"}
                    </p>

                    <p>
                      <CalendarDays size={17} />
                      <span>
                        <strong>Appointment:</strong>{" "}
                        {formatDate(booking.bookingDate)}
                      </span>
                    </p>

                    <p>
                      <FlaskConical size={17} />
                      <span>
                        <strong>Laboratory:</strong>{" "}
                        {booking.lab?.name || "Laboratory details unavailable"}
                      </span>
                    </p>

                    <p>
                      <ClipboardList size={17} />
                      <span>
                        <strong>Tests:</strong>{" "}
                        {Array.isArray(booking.tests) &&
                        booking.tests.length > 0
                          ? booking.tests
                              .map((item) => item.test?.name || "Test")
                              .join(", ")
                          : "Test details unavailable"}
                      </span>
                    </p>

                    <p>
                      <MapPin size={17} />
                      <span>
                        <strong>Collection:</strong>{" "}
                        {booking.collectionType === "home"
                          ? "Home collection"
                          : "Visit laboratory"}
                        {booking.city ? ` — ${booking.city}` : ""}
                      </span>
                    </p>

                    <p>
                      <Clock3 size={17} />
                      <span>
                        <strong>Payment:</strong>{" "}
                        {formatStatus(booking.paymentStatus)}
                        {" · "}
                        {formatStatus(booking.paymentMethod)}
                      </span>
                    </p>
                  </div>

                  <div className="booking-card-footer">
                    <div>
                      <small>Total amount</small>
                      <strong>
                        ₹
                        {Number(booking.totalAmount || 0).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <Link to="/bookings" className="btn btn-brand">
                      Refresh list <RefreshCw size={16} />
                    </Link>
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
