
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

export default function LabStaff() {
  const [labs, setLabs] = useState([]);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pinCode: "",
    address: "",
    password: "",
    labId: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadLabs = async () => {
      try {
        const response = await fetch(`${API}/labs`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Labs load nahi ho paye.");
        }

        const list = Array.isArray(data)
          ? data
          : data.labs || data.data || [];

        setLabs(list.filter((lab) => lab.isActive !== false));
      } catch (err) {
        setError(err.message || "Labs load karne mein error.");
      } finally {
        setLoadingLabs(false);
      }
    };

    loadLabs();
  }, []);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Admin login nahi mila. Dobara login karo.");
      return;
    }

    if (!form.labId) {
      setError("Laboratory select karo.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API}/admin/lab-staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lab Staff account create nahi hua.");
      }

      setMessage(
        `Lab Staff account created successfully: ${data.staff?.email || form.email}`
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        pinCode: "",
        address: "",
        password: "",
        labId: "",
      });
    } catch (err) {
      setError(err.message || "Kuch galat ho gaya.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: 760 }}>
        <div className="card-header bg-primary text-white p-4">
          <h3 className="mb-1">Create Lab Staff Account</h3>
          <p className="mb-0">
            Staff account banao aur laboratory assign karo.
          </p>
        </div>

        <div className="card-body p-4">
          {message && (
            <div className="alert alert-success" role="alert">
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={254}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Mobile Number</label>
                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  title="10 digit mobile number"
                  maxLength={10}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">PIN Code</label>
                <input
                  className="form-control"
                  name="pinCode"
                  value={form.pinCode}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  title="6 digit PIN code"
                  maxLength={6}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  maxLength={500}
                  rows={2}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Assign Laboratory *</label>
                <select
                  className="form-select"
                  name="labId"
                  value={form.labId}
                  onChange={handleChange}
                  required
                  disabled={loadingLabs || labs.length === 0}
                >
                  <option value="">
                    {loadingLabs
                      ? "Loading laboratories..."
                      : labs.length
                        ? "Select laboratory"
                        : "No active laboratories found"}
                  </option>

                  {labs.map((lab) => (
                    <option key={lab._id || lab.id} value={lab._id || lab.id}>
                      {lab.name} — {lab.city || ""}
                    </option>
                  ))}
                </select>

                {!loadingLabs && labs.length === 0 && (
                  <small className="text-danger">
                    Pehle Admin panel se active laboratory create karo.
                  </small>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">Temporary Password *</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
                <small className="text-muted">
                  Kam se kam 8 characters ka password rakho.
                </small>
              </div>

              <div className="col-12 d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={submitting || loadingLabs || labs.length === 0}
                >
                  {submitting ? "Creating..." : "Create Lab Staff"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
