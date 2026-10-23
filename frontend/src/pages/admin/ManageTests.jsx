
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Pencil,
  Power,
  FlaskConical,
  X,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/tests";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  duration: "",
  category: "",
};

export default function ManageTests() {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadTests() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tests load nahi ho sake.");
      }

      setTests(data.tests || []);
    } catch (err) {
      setError(err.message || "Backend se connection nahi ho paya.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTests();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function openEditForm(test) {
    setForm({
      name: test.name || "",
      description: test.description || "",
      price: String(test.price ?? ""),
      duration: String(test.duration ?? ""),
      category: test.category || "",
    });

    setEditingId(test._id);
    setShowForm(true);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getToken() {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Login token nahi mila. Admin ke roop mein login karo.");
    }

    return token;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = getToken();

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        duration: Number(form.duration),
        category: form.category.trim(),
      };

      const isEditing = Boolean(editingId);
      const url = isEditing
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Test save nahi ho saka.");
      }

      setMessage(
        isEditing
          ? "Test successfully update ho gaya."
          : "Test successfully add ho gaya."
      );

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await loadTests();
    } catch (err) {
      setError(err.message || "Kuch galat ho gaya.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(test) {
    const confirmed = window.confirm(
      `"${test.name}" ko deactivate karna chahte ho?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/${test._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Test deactivate nahi hua.");
      }

      setMessage("Test successfully deactivate ho gaya.");
      await loadTests();
    } catch (err) {
      setError(err.message || "Kuch galat ho gaya.");
    }
  }

  return (
    <div className="management-page">
      <Link to="/admin" className="text-link management-back">
        <ArrowLeft size={17} />
        Back to dashboard
      </Link>

      <div className="dashboard-welcome management-welcome">
        <div>
          <span className="section-kicker">ADMINISTRATION</span>
          <h1>Manage Tests</h1>
          <p>Add, update and manage diagnostic tests.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={showForm ? () => {
            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
            setError("");
          } : openAddForm}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : "Add Test"}
        </button>
      </div>

      {message && (
        <p className="success-message" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {showForm && (
        <section className="dashboard-panel management-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>{editingId ? "Edit Test" : "Add New Test"}</h2>
              <p>Enter the diagnostic test details below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lab-form">
            <div className="lab-form-grid">
              <label>
                Test Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={150}
                  placeholder="Complete Blood Count"
                />
              </label>

              <label>
                Price (₹) *
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="500"
                />
              </label>

              <label>
                Duration (minutes) *
                <input
                  name="duration"
                  type="number"
                  value={form.duration}
                  onChange={handleChange}
                  required
                  min="1"
                  step="1"
                  placeholder="30"
                />
              </label>

              <label>
                Category *
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="Blood Test"
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
                maxLength={2000}
                placeholder="Test details and preparation instructions"
              />
            </label>

            <div className="test-form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Test"
                    : "Save Test"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                  setError("");
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="dashboard-panel management-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Diagnostic Tests</h2>
            <p>Tests retrieved from your backend.</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadTests}
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
                <th>Test Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>Loading tests...</td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="dashboard-empty-state">
                      <FlaskConical size={27} />
                      <strong>No tests found</strong>
                      <span>
                        Add a diagnostic test using the Add Test button.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                tests.map((test) => (
                  <tr key={test._id}>
                    <td>
                      <strong>{test.name}</strong>
                      {test.description && (
                        <div className="test-description-text">
                          {test.description}
                        </div>
                      )}
                    </td>

                    <td>{test.category || "—"}</td>

                    <td>
                      ₹{Number(test.price || 0).toLocaleString("en-IN")}
                    </td>

                    <td>{test.duration} min</td>

                    <td>
                      <div className="test-row-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => openEditForm(test)}
                          title="Edit test"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDeactivate(test)}
                          title="Deactivate test"
                        >
                          <Power size={15} />
                          Deactivate
                        </button>
                      </div>
                    </td>
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
