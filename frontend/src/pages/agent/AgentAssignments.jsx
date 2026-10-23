
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  RefreshCw,
  Search,
  MapPin,
  CalendarDays,
  UserRound,
  Phone,
  CheckCircle2,
  Clock,
  FlaskConical,
  Navigation,
} from "lucide-react";
import { apiRequest } from "../../services/api";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  "sample-collected": "Sample Collected",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(value) {
  if (!value) return "Date not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getArea(booking) {
  return [
    booking.address,
    booking.city,
    booking.state,
    booking.pincode,
  ]
    .filter(Boolean)
    .join(", ") || "Address not provided";
}

function getNextAction(booking) {
  if (booking.bookingStatus === "confirmed") {
    return {
      label: "Mark sample collected",
      status: "sample-collected",
    };
  }

  if (booking.bookingStatus === "sample-collected") {
    return {
      label: "Complete booking",
      status: "completed",
    };
  }

  return null;
}

function getMapsUrl(booking) {
  const address = getArea(booking);

  if (address === "Address not provided") return "";

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default function AgentAssignments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Login token nahi mila. Agent account se dobara login karein.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest("/agent/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      setError(err.message || "Assignments load nahi ho sake.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const customerName =
        booking.patientName || booking.customer?.name || "";

      const searchableText = [
        booking._id,
        customerName,
        booking.mobile,
        booking.lab?.name,
        booking.address,
        booking.city,
        booking.state,
        booking.pincode,
        booking.bookingStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || searchableText.includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        booking.bookingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const updateStatus = async (booking) => {
    const action = getNextAction(booking);

    if (!action) return;

    const confirmed = window.confirm(
      `Booking ka status "${STATUS_LABELS[action.status]}" karna hai?`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Login token nahi mila. Dobara login karein.");
      return;
    }

    setUpdatingId(booking._id);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest(
        `/agent/bookings/${booking._id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingStatus: action.status,
          }),
        }
      );

      setBookings((previous) =>
        previous.map((item) =>
          item._id === booking._id
            ? {
                ...item,
                bookingStatus:
                  data.booking?.bookingStatus || action.status,
              }
            : item
        )
      );

      setMessage(data.message || "Booking status update ho gaya.");
    } catch (err) {
      setError(err.message || "Status update karte waqt error aaya.");
    } finally {
      setUpdatingId("");
    }
  };

  const stats = [
    {
      label: "Total assignments",
      value: bookings.length,
      icon: <ClipboardList size={21} />,
    },
    {
      label: "Pending / Confirmed",
      value: bookings.filter((booking) =>
        ["pending", "confirmed"].includes(booking.bookingStatus)
      ).length,
      icon: <Clock size={21} />,
    },
    {
      label: "Samples collected",
      value: bookings.filter(
        (booking) => booking.bookingStatus === "sample-collected"
      ).length,
      icon: <FlaskConical size={21} />,
    },
    {
      label: "Completed",
      value: bookings.filter(
        (booking) => booking.bookingStatus === "completed"
      ).length,
      icon: <CheckCircle2 size={21} />,
    },
  ];

  return (
    <div className="management-page">
      <Link to="/agent" className="text-link management-back">
        <ArrowLeft size={17} />
        Back to dashboard
      </Link>

      <div className="dashboard-welcome management-welcome">
        <div>
          <span className="section-kicker">COLLECTION OPERATIONS</span>
          <h1>My assignments</h1>
          <p>
            Apni assigned bookings dekhein, patient ko call karein,
            location kholein aur status update karein.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          disabled={loading}
          className="text-link"
        >
          <RefreshCw size={16} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
          gap: 16,
          marginBottom: 22,
        }}
      >
        {stats.map((stat) => (
          <section
            className="dashboard-panel"
            key={stat.label}
            style={{ padding: 20 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{stat.label}</span>
              {stat.icon}
            </div>
            <h2 style={{ fontSize: 30, marginTop: 14 }}>{stat.value}</h2>
          </section>
        ))}
      </div>

      <section className="dashboard-panel management-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Assigned collection visits</h2>
            <p>Sirf tumhare agent account ko assigned bookings yahan dikhenge.</p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            margin: "18px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: "1 1 240px",
              border: "1px solid #dce5df",
              borderRadius: 10,
              padding: "0 12px",
            }}
          >
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search booking, patient, area..."
              aria-label="Search assignments"
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                padding: "12px 0",
                background: "transparent",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter assignments by status"
            style={{
              minWidth: 170,
              border: "1px solid #dce5df",
              borderRadius: 10,
              padding: "10px 12px",
              background: "#fff",
            }}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="sample-collected">Sample collected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: 12,
              marginBottom: 14,
              borderRadius: 8,
              background: "#fff0f0",
              color: "#a32020",
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            style={{
              padding: 12,
              marginBottom: 14,
              borderRadius: 8,
              background: "#e9f8ef",
              color: "#126b3b",
            }}
          >
            {message}
          </div>
        )}

        {loading && bookings.length === 0 ? (
          <div className="dashboard-empty-state">
            <RefreshCw size={25} />
            <strong>Loading assignments...</strong>
          </div>
        ) : error && bookings.length === 0 ? (
          <div className="dashboard-empty-state">
            <ClipboardList size={27} />
            <strong>Assignments load nahi ho sake</strong>
            <span>Server aur login token check karke Refresh karein.</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="dashboard-empty-state">
            <ClipboardList size={27} />
            <strong>
              {bookings.length === 0
                ? "No assignments yet"
                : "No matching assignments"}
            </strong>
            <span>
              {bookings.length === 0
                ? "Jab booking tumhe assign hogi, yahan dikh jayegi."
                : "Search ya status filter change karke dekho."}
            </span>
          </div>
        ) : (
          <div className="management-table-wrap">
            <table className="management-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Patient</th>
                  <th>Collection date</th>
                  <th>Area / Address</th>
                  <th>Lab / Tests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => {
                  const action = getNextAction(booking);
                  const mapsUrl = getMapsUrl(booking);

                  return (
                    <tr key={booking._id}>
                      <td>
                        <strong>
                          #{String(booking._id).slice(-6).toUpperCase()}
                        </strong>
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                          {booking.collectionType === "home"
                            ? "Home collection"
                            : "Lab visit"}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <UserRound size={15} />
                          <strong>
                            {booking.patientName || booking.customer?.name || "Patient"}
                          </strong>
                        </div>

                        {booking.mobile && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 12,
                              opacity: 0.75,
                              marginTop: 5,
                            }}
                          >
                            <Phone size={13} />
                            {booking.mobile}
                          </div>
                        )}

                        {booking.mobile && (
                          <a
                            href={`tel:${booking.mobile}`}
                            className="text-link"
                            style={{ display: "inline-flex", marginTop: 8 }}
                          >
                            <Phone size={14} />
                            Call patient
                          </a>
                        )}
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <CalendarDays size={15} />
                          {formatDate(booking.bookingDate)}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                          Time slot not specified
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                          <MapPin size={15} style={{ flexShrink: 0, marginTop: 3 }} />
                          <span>{getArea(booking)}</span>
                        </div>

                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-link"
                            style={{ display: "inline-flex", marginTop: 8 }}
                          >
                            <Navigation size={14} />
                            Open in Maps
                          </a>
                        )}
                      </td>

                      <td>
                        <div>{booking.lab?.name || "Lab not available"}</div>
                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                          {(booking.tests || [])
                            .map((item) => item.test?.name || item.name)
                            .filter(Boolean)
                            .join(", ") || "Tests not available"}
                        </div>
                      </td>

                      <td>
                        <span className="management-role">
                          {STATUS_LABELS[booking.bookingStatus] ||
                            booking.bookingStatus ||
                            "Unknown"}
                        </span>
                      </td>

                      <td>
                        {action ? (
                          <button
                            type="button"
                            disabled={updatingId === booking._id}
                            onClick={() => updateStatus(booking)}
                            style={{
                              border: "1px solid #dce5df",
                              borderRadius: 8,
                              padding: "9px 11px",
                              background: "#fff",
                              cursor: updatingId === booking._id ? "wait" : "pointer",
                              opacity: updatingId === booking._id ? 0.6 : 1,
                            }}
                          >
                            {updatingId === booking._id
                              ? "Updating..."
                              : action.label}
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, opacity: 0.7 }}>
                            No action available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ marginTop: 14, fontSize: 13, opacity: 0.7 }}>
          Showing {filteredBookings.length} of {bookings.length} assignments
        </p>
      </section>
    </div>
  );
}
