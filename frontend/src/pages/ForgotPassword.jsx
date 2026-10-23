
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Mail,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send OTP. Please try again."
        );
      }

      setMessage(
        data.message ||
          "If your account exists, an OTP will be sent to your email."
      );

      // Move to the OTP and new password page.
      navigate("/reset-password", {
        state: { email: email.trim().toLowerCase() },
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
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

        <span className="section-kicker">ACCOUNT RECOVERY</span>

        <h1>Forgot Password?</h1>

        <p className="auth-subtitle">
          Enter your registered email address. We will send
          you a password reset OTP.
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
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            className="btn btn-brand auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="auth-message" role="alert">
            {error}
          </p>
        )}

        <p className="auth-switch">
          <Link to="/login">
            <ArrowLeft
              size={15}
              style={{
                display: "inline",
                verticalAlign: "middle",
              }}
            />{" "}
            Back to Login
          </Link>
        </p>
      </section>
    </main>
  );
}
