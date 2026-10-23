
import { useCallback, useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api";

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "sample-collected",
  "completed",
  "cancelled",
];

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatStatus = (status) =>
  (status || "pending")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getBookingTests = (booking) => {
  if (!Array.isArray(booking.tests)) return "—";

  return booking.tests
    .map((item) => {
      const test = item.test;

      if (test && typeof test === "object") {
        return test.name || "Test";
      }

      return "Test";
    })
    .join(", ") || "—";
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const request = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [bookingData, agentData] = await Promise.all([
        request(`${API}/admin/bookings`),
        request(`${API}/admin/agents`),
      ]);

      setBookings(
        Array.isArray(bookingData.bookings) ? bookingData.bookings : []
      );

      setAgents(
        Array.isArray(agentData.agents) ? agentData.agents : []
      );
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const customer =
        typeof booking.customer === "object" ? booking.customer : null;

      const lab = typeof booking.lab === "object" ? booking.lab : null;
      const agent = typeof booking.agent === "object" ? booking.agent : null;

      const matchesSearch =
        !query ||
        String(booking._id || "").toLowerCase().includes(query) ||
        String(customer?.name || "").toLowerCase().includes(query) ||
        String(customer?.email || "").toLowerCase().includes(query) ||
        String(lab?.name || "").toLowerCase().includes(query) ||
        String(agent?.name || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        booking.bookingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.bookingStatus === "pending").length,
      confirmed: bookings.filter((b) => b.bookingStatus === "confirmed").length,
      completed: bookings.filter((b) => b.bookingStatus === "completed").length,
    }),
    [bookings]
  );

  const handleAssignAgent = async (bookingId, agentId) => {
    if (!agentId) return;

    setUpdatingId(bookingId);
    setError("");
    setNotice("");

    try {
      const data = await request(
        `${API}/admin/bookings/${bookingId}/assign-agent`,
        {
          method: "PATCH",
          body: JSON.stringify({ agentId }),
        }
      );

      if (data.booking) {
        setBookings((previous) =>
          previous.map((booking) =>
            booking._id === bookingId ? data.booking : booking
          )
        );
      } else {
        await fetchData();
      }

      setNotice(data.message || "Agent assigned successfully.");
    } catch (err) {
      setError(err.message || "Failed to assign agent.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleStatusChange = async (bookingId, bookingStatus) => {
    setUpdatingId(bookingId);
    setError("");
    setNotice("");

    try {
      const data = await request(
        `${API}/admin/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ bookingStatus }),
        }
      );

      if (data.booking) {
        setBookings((previous) =>
          previous.map((booking) =>
            booking._id === bookingId
              ? { ...booking, ...data.booking }
              : booking
          )
        );
      } else {
        await fetchData();
      }

      setNotice(data.message || "Booking status updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update booking status.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="manage-bookings">
      <style>{`
        .manage-bookings {
          padding: 24px;
          color: #172033;
          width: 100%;
          box-sizing: border-box;
        }
        .mb-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }
        .mb-header h1 {
          margin: 0 0 6px;
          font-size: 27px;
        }
        .mb-muted { color: #64748b; font-size: 14px; }
        .mb-refresh, .mb-control {
          border: 1px solid #dbe2ea;
          border-radius: 8px;
          padding: 10px 12px;
          background: white;
          color: #172033;
          font: inherit;
        }
        .mb-refresh { cursor: pointer; }
        .mb-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }
        .mb-stat {
          background: white;
          border: 1px solid #e5eaf1;
          border-radius: 12px;
          padding: 18px;
        }
        .mb-stat strong {
          display: block;
          font-size: 25px;
          margin-top: 8px;
        }
        .mb-filters {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .mb-search { flex: 1; min-width: 200px; }
        .mb-message {
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 14px;
          overflow-wrap: anywhere;
        }
        .mb-error { background: #fff1f2; color: #be123c; }
        .mb-success { background: #ecfdf5; color: #047857; }
        .mb-table-wrap {
          overflow-x: auto;
          background: white;
          border: 1px solid #e5eaf1;
          border-radius: 12px;
        }
        .mb-table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
          font-size: 13px;
        }
        .mb-table th, .mb-table td {
          text-align: left;
          vertical-align: top;
          padding: 13px 12px;
          border-bottom: 1px solid #edf0f5;
        }
        .mb-table th {
          background: #f8fafc;
          color: #475569;
          font-weight: 600;
          white-space: nowrap;
        }
        .mb-table tbody tr:last-child td { border-bottom: 0; }
        .mb-table select { width: 160px; max-width: 100%; }
        .mb-id { font-weight: 600; overflow-wrap: anywhere; }
        .mb-empty {
          padding: 28px;
          text-align: center;
          color: #64748b;
        }
        @media (max-width: 800px) {
          .manage-bookings { padding: 14px; }
          .mb-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .mb-header h1 { font-size: 23px; }
        }
      `}</style>

      <div className="mb-header">
        <div>
          <h1>Manage Bookings</h1>
          <div className="mb-muted">
            View bookings, assign agents, and update booking status.
          </div>
        </div>

        <button
          type="button"
          className="mb-refresh"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      <div className="mb-stats">
        <div className="mb-stat">
          <span className="mb-muted">Total Bookings</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="mb-stat">
          <span className="mb-muted">Pending</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="mb-stat">
          <span className="mb-muted">Confirmed</span>
          <strong>{stats.confirmed}</strong>
        </div>
        <div className="mb-stat">
          <span className="mb-muted">Completed</span>
          <strong>{stats.completed}</strong>
        </div>
      </div>

      {error && (
        <div className="mb-message mb-error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-message mb-success" role="status">
          {notice}
        </div>
      )}

      <div className="mb-filters">
        <input
          className="mb-control mb-search"
          type="search"
          placeholder="Search booking ID, customer, lab, or agent..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="mb-control"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by booking status"
        >
          <option value="all">All statuses</option>
          {BOOKING_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-table-wrap">
        <table className="mb-table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Customer</th>
              <th>Lab</th>
              <th>Tests</th>
              <th>Amount</th>
              <th>Booked On</th>
              <th>Assign Agent</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="mb-empty">
                  Loading bookings...
                </td>
              </tr>
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="8" className="mb-empty">
                  No bookings found.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                const customer =
                  typeof booking.customer === "object"
                    ? booking.customer
                    : null;
                const lab =
                  typeof booking.lab === "object" ? booking.lab : null;
                const agent =
                  typeof booking.agent === "object" ? booking.agent : null;

                const currentAgentId = getId(booking.agent);
                const isTerminal = [
                  "completed",
                  "cancelled",
                ].includes(booking.bookingStatus);

                return (
                  <tr key={booking._id}>
                    <td>
                      <div className="mb-id">
                        {String(booking._id || "").slice(-8).toUpperCase()}
                      </div>
                      <div className="mb-muted">
                        {booking.bookingType || "Booking"}
                      </div>
                    </td>

                    <td>
                      <strong>{customer?.name || "Unknown customer"}</strong>
                      <div className="mb-muted">{customer?.email || ""}</div>
                      <div className="mb-muted">{customer?.phone || ""}</div>
                    </td>

                    <td>
                      <strong>{lab?.name || "Unknown lab"}</strong>
                      <div className="mb-muted">
                        {[lab?.city, lab?.state].filter(Boolean).join(", ")}
                      </div>
                    </td>

                    <td>{getBookingTests(booking)}</td>

                    <td>
                      ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td>{formatDate(booking.createdAt)}</td>

                    <td>
                      <select
                        className="mb-control"
                        aria-label={`Assign agent to booking ${booking._id}`}
                        value={currentAgentId}
                        disabled={isTerminal || updatingId === booking._id}
                        onChange={(event) =>
                          handleAssignAgent(booking._id, event.target.value)
                        }
                      >
                        <option value="">Select agent</option>

                        {currentAgentId &&
                          !agents.some(
                            (item) => item._id === currentAgentId
                          ) && (
                            <option value={currentAgentId}>
                              {agent?.name || "Currently assigned agent"}
                            </option>
                          )}

                        {agents.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name} ({item.email})
                          </option>
                        ))}
                      </select>

                      {agent?.name && (
                        <div className="mb-muted" style={{ marginTop: 5 }}>
                          Assigned: {agent.name}
                        </div>
                      )}
                    </td>

                    <td>
                      <select
                        className="mb-control"
                        aria-label={`Update status for booking ${booking._id}`}
                        value={booking.bookingStatus || "pending"}
                        disabled={
                          updatingId === booking._id ||
                          booking.bookingStatus === "cancelled"
                        }
                        onChange={(event) =>
                          handleStatusChange(booking._id, event.target.value)
                        }
                      >
                        {BOOKING_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {formatStatus(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mb-muted" style={{ marginTop: 12 }}>
        Showing {filteredBookings.length} of {bookings.length} bookings.
        {agents.length === 0 && !loading
          ? " No active agents found. Create or activate an agent first."
          : ""}
      </p>
    </div>
  );
}
