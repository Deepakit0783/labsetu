
import { useState } from "react";
import { UserPlus, UserRound, Mail, Phone, MapPin, LockKeyhole } from "lucide-react";
import { apiRequest } from "../../services/api";

export default function CreateAgent() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pinCode: "",
    address: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!/^\d{10}$/.test(form.phone)) {
      setMessage("Phone number must contain exactly 10 digits.");
      setMessageType("error");
      return;
    }

    if (!/^\d{6}$/.test(form.pinCode)) {
      setMessage("PIN code must contain exactly 6 digits.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/admin/agents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          pinCode: form.pinCode.trim(),
          address: form.address.trim(),
        }),
      });

      setMessage(data.message || "Agent created successfully.");
      setMessageType("success");

      setForm({
        name: "",
        email: "",
        phone: "",
        pinCode: "",
        address: "",
        password: "",
      });
    } catch (error) {
      setMessage(error.message || "Unable to create agent.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-page">
      <div className="page-header">
        <div>
          <span className="section-kicker">AGENT MANAGEMENT</span>
          <h1>Create Agent</h1>
          <p>Add a new collection agent to LabSetu.</p>
        </div>
        <div className="auth-brand-icon">
          <UserPlus size={26} />
        </div>
      </div>

      <div className="auth-card create-agent-card">
        <h2>Agent Details</h2>
        <p className="auth-subtitle">
          Enter the details to create an active agent account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="agent-name">Full name</label>
          <div className="auth-input">
            <UserRound size={18} />
            <input
              id="agent-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          <label htmlFor="agent-email">Email address</label>
          <div className="auth-input">
            <Mail size={18} />
            <input
              id="agent-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="agent@example.com"
              maxLength={254}
              required
            />
          </div>

          <label htmlFor="agent-phone">Phone number</label>
          <div className="auth-input">
            <Phone size={18} />
            <input
              id="agent-phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  phone: event.target.value.replace(/\D/g, "").slice(0, 10),
                }))
              }
              placeholder="10-digit phone number"
              maxLength={10}
              required
            />
          </div>

          <label htmlFor="agent-pin">PIN code</label>
          <div className="auth-input">
            <MapPin size={18} />
            <input
              id="agent-pin"
              name="pinCode"
              inputMode="numeric"
              value={form.pinCode}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  pinCode: event.target.value.replace(/\D/g, "").slice(0, 6),
                }))
              }
              placeholder="6-digit PIN code"
              maxLength={6}
              required
            />
          </div>

          <label htmlFor="agent-address">Address</label>
          <div className="auth-input">
            <MapPin size={18} />
            <input
              id="agent-address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter address"
              maxLength={500}
              required
            />
          </div>

          <label htmlFor="agent-password">Temporary password</label>
          <div className="auth-input">
            <LockKeyhole size={18} />
            <input
              id="agent-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength={8}
              required
            />
          </div>

          <button
            className="btn btn-brand auth-submit"
            type="submit"
            disabled={loading}
          >
            <UserPlus size={17} />
            {loading ? "Creating agent..." : "Create Agent"}
          </button>
        </form>

        {message && (
          <p
            className="auth-message"
            role="status"
            style={{
              color: messageType === "success" ? "green" : "crimson",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
