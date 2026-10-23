
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, CalendarDays, FlaskConical, AlertCircle } from "lucide-react";

const API = "http://localhost:5000/api";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

export default function LabBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Login required. Please log in with your Lab Staff account."
        );
      }

      const response = await fetch(`${API}/bookings/lab/completed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to load bookings (${response.status}).`
        );
      }

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      setError(err.message || "Unable to load bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return (
    <div style={{ padding: "24px", color: "#172033" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 8px" }}>Lab Bookings</h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            View completed bookings assigned to your laboratory.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBookings}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            border: "1px solid #dbe2ea",
            borderRadius: "8px",
            background: "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw size={16} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: "14px",
            marginBottom: "18px",
            background: "#fff1f2",
            color: "#be123c",
            borderRadius: "8px",
          }}
        >
          <AlertCircle
            size={17}
            style={{ verticalAlign: "middle", marginRight: "6px" }}
          />
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          Loading completed bookings...
        </div>
      ) : !error && bookings.length === 0 ? (
        <div
          style={{
            background: "white",
            border: "1px solid #e5eaf1",
            borderRadius: "12px",
            padding: "40px 20px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          <CalendarDays size={34} />
          <h3>No completed bookings</h3>
          <p>
            No completed bookings were found for your assigned laboratory.
          </p>
          <p>
            Ask the admin to check the booking status and your lab assignment.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {bookings.map((booking) => (
            <section
              key={booking._id}
              style={{
                background: "white",
                border: "1px solid #e5eaf1",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 8px" }}>
                    Booking #{booking._id.slice(-8).toUpperCase()}
                  </h3>
                  <p style={{ margin: "4px 0", color: "#475569" }}>
                    Patient: {booking.patientName || booking.customer?.name || "—"}
                  </p>
                  <p style={{ margin: "4px 0", color: "#475569" }}>
                    Mobile: {booking.mobile || booking.customer?.phone || "—"}
                  </p>
                </div>

                <span
                  style={{
                    alignSelf: "flex-start",
                    background: "#dcfce7",
                    color: "#166534",
                    padding: "6px 10px",
                    borderRadius: "20px",
                    fontSize: "13px",
                  }}
                >
                  {booking.bookingStatus || "completed"}
                </span>
              </div>

              <hr style={{ border: 0, borderTop: "1px solid #edf0f5" }} />

              <p>
                <strong>Lab:</strong> {booking.lab?.name || "—"}
              </p>
              <p>
                <strong>Booking date:</strong> {formatDate(booking.bookingDate)}
              </p>
              <p>
                <strong>Collection type:</strong> {booking.collectionType || "—"}
              </p>

              <h4>Tests</h4>

              {Array.isArray(booking.tests) && booking.tests.length > 0 ? (
                <ul>
                  {booking.tests.map((item, index) => {
                    const test = item.test;

                    return (
                      <li
                        key={
                          (typeof test === "object" ? test?._id : test) ||
                          index
                        }
                        style={{ marginBottom: "8px" }}
                      >
                        <FlaskConical
                          size={15}
                          style={{
                            verticalAlign: "middle",
                            marginRight: "6px",
                          }}
                        />
                        {typeof test === "object"
                          ? test?.name || "Test"
                          : "Test"}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No test details available.</p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
