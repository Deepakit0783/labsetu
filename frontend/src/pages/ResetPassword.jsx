
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  LockKeyhole,
  Mail,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must contain exactly 6 digits.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await fetch(
        `${apiUrl}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            otp,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reset password. Please try again."
        );
      }

      setMessage(
        data.message || "Password reset successfully. Please log in."
      );

      setPassword("");
      setConfirmPassword("");
      setOtp("");

      // Return to login after a successful reset.
      navigate("/login", {
        replace: true,
        state: {
          message: data.message || "Password reset successful. Please log in.",
          email: normalizedEmail,
        },
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

        <span className="section-kicker">SECURE YOUR ACCOUNT</span>

        <h1>Reset Password</h1>

        <p className="auth-subtitle">
          Enter the OTP sent to your email and create a new
          password for your LabSetu account.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Registered email address</label>

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

          <label htmlFor="otp">6-digit OTP</label>

          <div className="auth-input">
            <LockKeyhole size={18} />

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter OTP"
              required
            />
          </div>

          <label htmlFor="password">New password</label>

          <div className="auth-input">
            <LockKeyhole size={18} />

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <label htmlFor="confirmPassword">Confirm password</label>

          <div className="auth-input">
            <LockKeyhole size={18} />

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            className="btn btn-brand auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
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
