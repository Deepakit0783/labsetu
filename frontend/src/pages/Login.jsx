
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HeartPulse,
  Mail,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";
import { loginUser } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(
    location.state?.message || ""
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const data = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!data?.token || !data?.user) {
        throw new Error("Invalid login response from server.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.dispatchEvent(new Event("auth-change"));

      const role = String(data.user.role || "")
        .trim()
        .toLowerCase();

      const dashboardRoutes = {
        admin: "/admin",
        customer: "/dashboard",
        agent: "/agent",
        lab: "/lab",
      };

      const destination = dashboardRoutes[role];

      if (!destination) {
        setMessage(
          "Login successful, but your account role is not recognized."
        );
        return;
      }

      navigate(destination, { replace: true });
    } catch (error) {
      setMessage(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand-icon">
          <HeartPulse size={30} />
        </div>

        <span className="section-kicker">WELCOME BACK</span>

        <h1>Login to LabSetu</h1>

        <p className="auth-subtitle">
          Access your bookings and reports.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email address</label>

          <div className="auth-input">
            <Mail size={18} />

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <label htmlFor="password">Password</label>

          <div className="auth-input">
            <LockKeyhole size={18} />

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button
            className="btn btn-brand auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="status">
            {message}
          </p>
        )}

        <p className="auth-switch">
          New to LabSetu?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}