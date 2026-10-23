
import { NavLink, Outlet } from "react-router-dom";
import {
  HeartPulse,
  LayoutDashboard,
  FlaskConical,
  ClipboardList,
  Users,
  FileText,
  MapPin,
  UserRound,
  UserPlus,
  Menu,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const roleConfig = {
  admin: {
    title: "Admin Portal",
    subtitle: "Platform management",
    links: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/admin/labs", label: "Partner labs", icon: FlaskConical },
      { to: "/admin/tests", label: "Test catalogue", icon: FileText },
      { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/reports", label: "Manage Reports", icon: FileText },
      { to: "/admin/agents/create", label: "Create Agent", icon: UserPlus },
    ],
  },

  lab: {
    title: "Lab Partner",
    subtitle: "Laboratory workspace",
    links: [
      { to: "/lab", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/lab/tests", label: "My test listings", icon: FlaskConical },
      { to: "/lab/bookings", label: "Lab bookings", icon: ClipboardList },
      { to: "/lab/reports", label: "Reports", icon: FileText },
    ],
  },

  agent: {
    title: "Collection Agent",
    subtitle: "Collection workspace",
    links: [
      { to: "/agent", label: "Overview", icon: LayoutDashboard, end: true },
      {
        to: "/agent/assignments",
        label: "My assignments",
        icon: ClipboardList,
      },
      { to: "/agent/profile", label: "My profile", icon: UserRound },
    ],
  },
};

export default function DashboardLayout({ role }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const config = roleConfig[role];

  if (!config) {
    return <div className="dashboard-content">Dashboard role not found.</div>;
  }

  return (
    <div className="dashboard-shell">
      <aside
        className={`dashboard-sidebar ${menuOpen ? "sidebar-open" : ""}`}
      >
        <a href="/" className="dashboard-brand">
          <span className="dashboard-brand-icon">
            <HeartPulse size={24} />
          </span>
          <span>
            <strong>LabSetu</strong>
            <small>{config.title}</small>
          </span>
        </a>

        <div className="dashboard-nav-label">WORKSPACE</div>

        <nav className="dashboard-nav">
          {config.links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-location">
            <MapPin size={17} />
            <span>Sitamarhi, Bihar</span>
          </div>

          <a className="dashboard-logout" href="/login">
            <LogOut size={17} />
            Back to login
          </a>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            type="button"
            className="dashboard-menu-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle dashboard menu"
            aria-expanded={menuOpen}
          >
            <Menu size={22} />
          </button>

          <div className="dashboard-page-label">
            <strong>{config.title}</strong>
            <small>{config.subtitle}</small>
          </div>

          <div className="dashboard-user">
            <span className="dashboard-user-avatar">
              <UserRound size={19} />
            </span>
            <span>
              <strong>Demo account</strong>
              <small>Not authenticated</small>
            </span>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
          <p className="dashboard-demo-note">
            Demo dashboard — no live records or permissions are connected.
          </p>
        </main>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="dashboard-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
