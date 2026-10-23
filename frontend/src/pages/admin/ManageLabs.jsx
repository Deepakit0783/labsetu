
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, RefreshCw, Building2 } from "lucide-react";

const API_URL = "http://localhost:5000/api/labs";

const emptyForm = {
  name: "",
  description: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  homeCollection: false,
};

export default function ManageLabs() {
  const [labs, setLabs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadLabs() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Labs load nahi ho sakin.");
      }

      setLabs(data.labs || []);
    } catch (err) {
      setError(err.message || "Backend se connection nahi ho paya.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLabs();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Admin login token nahi mila. Dobara login karo.");
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          pincode: form.pincode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lab add nahi ho saki.");
      }

      setMessage("Lab successfully add ho gayi!");
      setForm(emptyForm);
      setShowForm(false);
      await loadLabs();
    } catch (err) {
      setError(err.message || "Kuch galat ho gaya.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="management-page">
      <Link to="/admin" className="text-link management-back">
        <ArrowLeft size={17} /> Back to dashboard
      </Link>

      <div className="dashboard-welcome management-welcome">
        <div>
          <span className="section-kicker">ADMINISTRATION</span>
          <h1>Partner Labs</h1>
          <p>Manage partner laboratories and their details.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setShowForm((previous) => !previous);
            setError("");
            setMessage("");
          }}
        >
          <Plus size={18} />
          {showForm ? "Close Form" : "Add Lab"}
        </button>
      </div>

      {message && (
        <p role="status" className="success-message">{message}</p>
      )}

      {error && (
        <p role="alert" className="error-message">{error}</p>
      )}

      {showForm && (
        <section className="dashboard-panel management-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Add New Lab</h2>
              <p>Fill in the laboratory details below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lab-form">
            <div className="lab-form-grid">
              <label>
                Lab Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={150}
                  placeholder="City Diagnostic Lab"
                />
              </label>

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="lab@example.com"
                />
              </label>

              <label>
                Phone
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                />
              </label>

              <label>
                Address
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street or area"
                />
              </label>

              <label>
                City
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </label>

              <label>
                State
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </label>

              <label>
                Pincode
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                  pattern="[1-9][0-9]{5}"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="843301"
                />
              </label>
            </div>

            <label className="lab-description">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Lab services and facilities"
              />
            </label>

            <label className="lab-checkbox">
              <input
                type="checkbox"
                name="homeCollection"
                checked={form.homeCollection}
                onChange={handleChange}
              />
              Home sample collection available
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Lab"}
            </button>
          </form>
        </section>
      )}

      <section className="dashboard-panel management-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Laboratory Records</h2>
            <p>Labs retrieved from your backend.</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadLabs}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="management-table-wrap">
          <table className="management-table">
            <thead>
              <tr>
                <th>Lab Name</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Home Collection</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>Loading labs...</td>
                </tr>
              ) : labs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="dashboard-empty-state">
                      <Building2 size={27} />
                      <strong>No labs found</strong>
                      <span>Add a lab using the Add Lab button.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                labs.map((lab) => (
                  <tr key={lab._id}>
                    <td>{lab.name}</td>
                    <td>
                      {lab.email || "—"}
                      <br />
                      {lab.phone || "—"}
                    </td>
                    <td>
                      {[lab.city, lab.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td>{lab.homeCollection ? "Available" : "No"}</td>
                    <td>{lab.isActive ? "Active" : "Inactive"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
