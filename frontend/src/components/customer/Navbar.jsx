
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  MapPin,
  Menu,
  X,
  UserRound,
  ArrowRight,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  function loadUser() {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setUser(null);
        return;
      }

      setUser(JSON.parse(storedUser));
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    loadUser();

    // Update navbar after login/logout in another component.
    window.addEventListener("storage", loadUser);
    window.addEventListener("auth-change", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("auth-change", loadUser);
    };
  }, []);

  const close = () => setOpen(false);

  const role = String(user?.role || "").toLowerCase();

  const dashboardPath = {
    admin: "/admin",
    customer: "/dashboard",
    lab: "/lab",
    agent: "/agent",
  }[role] || "/dashboard";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    close();
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login", { replace: true });
  }

  return (
    <>
      <div className="top-strip">
        <div className="page-container top-strip-inner">
          <span>
            <MapPin size={14} /> Sitamarhi, Bihar
          </span>
          <span className="top-strip-message">
            Diagnostic booking made simpler
          </span>
        </div>
      </div>

      <header className="site-header">
        <div className="page-container navbar-inner">
          <Link to="/" className="brand" onClick={close}>
            <span className="brand-icon">
              <HeartPulse size={26} />
            </span>
            <span className="brand-text">
              <strong>Lab<span>Setu</span></strong>
              <small>Aapki Sehat, Hamari Priority</small>
            </span>
          </Link>

          <nav className={`nav-links ${open ? "nav-open" : ""}`}>
            <NavLink to="/" end onClick={close}>Home</NavLink>
            <NavLink to="/tests" onClick={close}>Tests</NavLink>
            <NavLink to="/labs" onClick={close}>Compare Labs</NavLink>
            <a href="/#how-it-works" onClick={close}>How It Works</a>

            {user && (
              <>
                <Link to={dashboardPath} onClick={close}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>

                {role === "customer" && (
                  <Link to="/profile" onClick={close}>
                    <UserRound size={16} /> My Profile
                  </Link>
                )}
              </>
            )}

            <div className="mobile-nav-actions">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="btn btn-outline-brand"
                    onClick={close}
                  >
                    <UserRound size={17} /> Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-brand"
                    onClick={close}
                  >
                    Get Started <ArrowRight size={16} />
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-brand"
                  onClick={logout}
                >
                  <LogOut size={17} /> Logout
                </button>
              )}
            </div>
          </nav>

          <div className="desktop-actions">
            {!user ? (
              <>
                <Link to="/login" className="login-link">
                  <UserRound size={17} /> Login
                </Link>
                <Link to="/register" className="btn btn-brand nav-cta">
                  Get Started <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <Link to={dashboardPath} className="login-link">
                  <UserRound size={17} />
                  {user.name || "My Account"}
                </Link>
                <button
                  type="button"
                  className="btn btn-brand nav-cta"
                  onClick={logout}
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            {open ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </header>
    </>
  );
}
