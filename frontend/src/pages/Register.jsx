
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
} from "lucide-react";
import { registerUser } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const data = await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.mobile,
        password: form.password,
      });

      // Save token and user after successful registration
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("Registration successful!");

      // Go to login page after successful registration
      navigate("/login", {
        state: { message: "Account created successfully. Please log in." },
      });
    } catch (error) {
      setMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand-icon"><HeartPulse size={30} /></div>
        <span className="section-kicker">JOIN LABSETU</span>
        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Keep your bookings and reports organised in one place.
        </p>

        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="name">Full name</label>
          <div className="auth-input">
            <UserRound size={18} />
            <input
              id="name"
              value={form.name}
              required
              minLength={2}
              maxLength={100}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>

          <label htmlFor="reg-email">Email address</label>
          <div className="auth-input">
            <Mail size={18} />
            <input
              id="reg-email"
              type="email"
              value={form.email}
              required
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <label htmlFor="mobile">Mobile number</label>
          <div className="auth-input">
            <Phone size={18} />
            <input
              id="mobile"
              type="tel"
              inputMode="numeric"
              value={form.mobile}
              required
              pattern="[0-9]{10}"
              maxLength={10}
              onChange={(e) =>
                update("mobile", e.target.value.replace(/\D/g, ""))
              }
              placeholder="10-digit mobile number"
              autoComplete="tel"
            />
          </div>

          <label htmlFor="reg-password">Password</label>
          <div className="auth-input">
            <LockKeyhole size={18} />
            <input
              id="reg-password"
              type="password"
              minLength={8}
              maxLength={128}
              value={form.password}
              required
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>

          <button
            className="btn btn-brand auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {message && (
          <p className="auth-message" role="status">{message}</p>
        )}

        <p className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
