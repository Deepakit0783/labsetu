
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ClipboardList,
  FlaskConical,
  Users,
  Clock3,
  ShieldCheck,
  FileText,
  UserRound,
  CalendarDays,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const configs = {
  customer: {
    heading: "My Dashboard",
    description: "Manage your bookings, medical reports and profile.",
    cards: [
      { label: "My Bookings", value: "—", note: "View your appointments", icon: ClipboardList },
      { label: "My Reports", value: "—", note: "View available reports", icon: FileText },
      { label: "Available Tests", value: "Browse", note: "Explore health tests", icon: FlaskConical },
      { label: "My Profile", value: "Account", note: "Manage your details", icon: UserRound },
    ],
    actions: [
      { label: "Book a Test", to: "/tests", icon: CalendarDays },
      { label: "My Bookings", to: "/bookings", icon: ClipboardList },
      { label: "My Reports", to: "/reports", icon: FileText },
      { label: "My Profile", to: "/profile", icon: Users },
      { label: "Find Laboratories", to: "/labs", icon: FlaskConical },
    ],
  },

  admin: {
    heading: "Platform overview",
    description: "Manage partner labs, catalogue listings and platform activity.",
    cards: [
      { label: "Partner labs", value: "—", note: "Active laboratories", icon: FlaskConical },
      { label: "Total bookings", value: "—", note: "All bookings", icon: ClipboardList },
      { label: "Registered users", value: "—", note: "Customer accounts", icon: Users },
      { label: "Active tests", value: "—", note: "Available test listings", icon: FileText },
      { label: "Total agents", value: "—", note: "Registered agents", icon: UserRound },
      { label: "Pending bookings", value: "—", note: "Awaiting processing", icon: Clock3 },
      { label: "Completed bookings", value: "—", note: "Successfully completed", icon: ShieldCheck },
      { label: "Total revenue", value: "—", note: "Paid, non-cancelled bookings", icon: ArrowUpRight },
    ],
    actions: [
      { label: "Review partner labs", to: "/admin/labs", icon: FlaskConical },
      { label: "Manage catalogue", to: "/admin/tests", icon: FileText },
      { label: "Review bookings", to: "/admin/bookings", icon: ClipboardList },
      { label: "Manage users", to: "/admin/users", icon: Users },
    ],
  },

  lab: {
    heading: "Laboratory overview",
    description: "Manage your approved test listings, bookings and reports.",
    cards: [
      { label: "Active listings", value: "—", note: "No live data", icon: FlaskConical },
      { label: "New bookings", value: "—", note: "No live data", icon: ClipboardList },
      { label: "Pending reports", value: "—", note: "No live data", icon: FileText },
      { label: "Completed tests", value: "—", note: "No live data", icon: ShieldCheck },
    ],
    actions: [
      { label: "View test listings", to: "/lab/tests", icon: FlaskConical },
      { label: "Manage bookings", to: "/lab/bookings", icon: ClipboardList },
      { label: "Manage reports", to: "/lab/reports", icon: FileText },
    ],
  },

  agent: {
    heading: "Collection overview",
    description: "Review assigned visits and update sample collection status.",
    cards: [
      { label: "Assigned visits", value: "—", note: "Assigned to you", icon: ClipboardList },
      { label: "Today's visits", value: "—", note: "Scheduled for today", icon: Clock3 },
      { label: "Collected samples", value: "—", note: "Samples collected", icon: FlaskConical },
      { label: "Completed visits", value: "—", note: "Successfully completed", icon: ShieldCheck },
    ],
    actions: [
      { label: "View assignments", to: "/agent/assignments", icon: ClipboardList },
      { label: "Update profile", to: "/agent/profile", icon: Users },
    ],
  },
};

function getDashboardData(response) {
  const root = response?.data ?? response;
  return root?.stats ?? root?.statistics ?? root?.dashboard ?? root;
}

function getCount(data, keys) {
  for (const key of keys) {
    const value = data?.[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value.toLocaleString("en-IN");
    }

    if (Array.isArray(value)) {
      return value.length.toLocaleString("en-IN");
    }

    if (value && typeof value === "object" && typeof value.count === "number") {
      return value.count.toLocaleString("en-IN");
    }
  }

  return "—";
}

function formatDate(date) {
  if (!date) return "Date not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date not available";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isToday(dateValue) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const today = new Date();

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function DashboardHome({ role = "customer" }) {
  const config = configs[role];

  const [adminStats, setAdminStats] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [agentBookings, setAgentBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!["customer", "admin", "agent"].includes(role)) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to load your dashboard.");
      return;
    }

    const controller = new AbortController();

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const endpoint =
          role === "customer"
            ? `${API_URL}/api/bookings/my`
            : role === "admin"
              ? `${API_URL}/api/admin/dashboard`
              : `${API_URL}/api/agent/bookings`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || `Request failed (${response.status})`
          );
        }

        if (role === "customer") {
          const bookings = Array.isArray(result.bookings)
            ? result.bookings
            : Array.isArray(result.data?.bookings)
              ? result.data.bookings
              : [];

          setCustomerBookings(bookings);
        } else if (role === "admin") {
          setAdminStats(getDashboardData(result));
        } else {
          setAgentBookings(
            Array.isArray(result.bookings) ? result.bookings : []
          );
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load dashboard data.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, [role]);

  if (!config) {
    return (
      <div className="dashboard-overview">
        <h1>Dashboard unavailable</h1>
        <p>Your account role is not recognized.</p>
        <Link to="/">Return Home</Link>
      </div>
    );
  }

  let cards = config.cards;

  if (role === "customer") {
    cards = config.cards.map((card) => {
      if (card.label === "My Bookings") {
        return {
          ...card,
          value:
            loading && customerBookings.length === 0
              ? "..."
              : customerBookings.length.toLocaleString("en-IN"),
          note: "Your appointments",
        };
      }

      return card;
    });
  }

  if (role === "agent") {
    const values = {
      "Assigned visits": agentBookings.length,
      "Today's visits": agentBookings.filter((booking) =>
        isToday(booking.bookingDate)
      ).length,
      "Collected samples": agentBookings.filter(
        (booking) => booking.bookingStatus === "sample-collected"
      ).length,
      "Completed visits": agentBookings.filter(
        (booking) => booking.bookingStatus === "completed"
      ).length,
    };

    cards = config.cards.map((card) => ({
      ...card,
      value:
        loading && agentBookings.length === 0
          ? "..."
          : values[card.label].toLocaleString("en-IN"),
      note:
        card.label === "Today's visits"
          ? "Based on booking date"
          : "Live booking data",
    }));
  }

  if (role === "admin" && adminStats) {
    cards = [
      {
        label: "Partner labs",
        value: getCount(adminStats, ["totalLabs"]),
        note: "Active laboratories",
        icon: FlaskIcon(),
      },
      {
        label: "Total bookings",
        value: getCount(adminStats, ["totalBookings"]),
        note: "All bookings",
        icon: ClipboardList,
      },
      {
        label: "Registered users",
        value: getCount(adminStats, ["totalUsers"]),
        note: "Customer accounts",
        icon: Users,
      },
      {
        label: "Active tests",
        value: getCount(adminStats, ["totalTests"]),
        note: "Available test listings",
        icon: FileText,
      },
      {
        label: "Total agents",
        value: getCount(adminStats, ["totalAgents"]),
        note: "Registered agents",
        icon: UserRound,
      },
      {
        label: "Pending bookings",
        value: getCount(adminStats, ["pendingBookings"]),
        note: "Awaiting processing",
        icon: Clock3,
      },
      {
        label: "Completed bookings",
        value: getCount(adminStats, ["completedBookings"]),
        note: "Successfully completed",
        icon: ShieldCheck,
      },
      {
        label: "Total revenue",
        value:
          adminStats.totalRevenue != null
            ? `₹${Number(adminStats.totalRevenue).toLocaleString("en-IN")}`
            : "—",
        note: "Paid, non-cancelled bookings",
        icon: ArrowUpRight,
      },
    ];
  }

  const recentBookings =
    role === "customer"
      ? customerBookings
      : role === "agent"
        ? agentBookings
        : [];

  return (
    <div className="dashboard-overview">
      <div className="dashboard-welcome">
        <div>
          <span className="section-kicker">DASHBOARD</span>
          <h1>{config.heading}</h1>
          <p>{config.description}</p>
        </div>

        <span className="dashboard-welcome-icon">
          <ShieldCheck size={29} />
        </span>
      </div>

      {loading && <p role="status">Loading dashboard data...</p>}

      {error && (
        <div role="alert" className="dashboard-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      <div className="dashboard-stat-grid">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <article className="dashboard-stat-card" key={label}>
            <div className="dashboard-stat-top">
              <span>{label}</span>
              <span className="dashboard-stat-icon">
                <Icon size={20} />
              </span>
            </div>

            <strong className="dashboard-stat-value">{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>

      <section className="dashboard-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Quick actions</h2>
            <p>Open the area you need.</p>
          </div>
        </div>

        <div className="dashboard-action-grid">
          {config.actions.map(({ label, to, icon: Icon }) => (
            <Link className="dashboard-action-card" to={to} key={to}>
              <span><Icon size={22} /></span>
              <strong>{label}</strong>
              <ArrowUpRight size={18} className="dashboard-action-arrow" />
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-panel dashboard-activity-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Recent activity</h2>
            <p>
              {role === "customer"
                ? "Your latest bookings."
                : role === "admin"
                  ? "Platform activity overview."
                  : role === "agent"
                    ? "Your assigned collection visits."
                    : "Your latest activity."}
            </p>
          </div>
        </div>

        {(role === "customer" || role === "agent") &&
        recentBookings.length > 0 ? (
          <div className="dashboard-recent-bookings">
            {recentBookings.slice(0, 3).map((booking) => (
              <article key={booking._id} className="dashboard-recent-booking">
                <div>
                  <strong>
                    {booking.patientName || "Patient booking"}
                  </strong>
                  <p>
                    {booking.lab?.name || "Laboratory"} ·{" "}
                    {formatDate(booking.bookingDate)}
                  </p>
                  <small>
                    Status: {booking.bookingStatus || "pending"}
                  </small>
                </div>

                <Link
                  to={role === "agent" ? "/agent/assignments" : "/bookings"}
                  aria-label="View booking"
                >
                  View <ArrowUpRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <ClipboardList size={27} />
            <strong>
              {loading
                ? "Loading activity..."
                : role === "customer" || role === "agent"
                  ? "No bookings to show"
                  : "No activity to show"}
            </strong>
            <span>
              {role === "agent"
                ? "Assigned collection visits will appear here."
                : role === "customer"
                  ? "Your bookings will appear here after they are loaded."
                  : "Live activity has not been connected to this section yet."}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

function FlaskIcon() {
  return FlaskConical;
}
