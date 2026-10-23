
import { useCallback, useEffect, useState } from "react";

const API = "http://localhost:5000/api";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
};

const getName = (value, fallback = "N/A") => {
  if (!value) return fallback;
  if (typeof value === "object") {
    return value.name || value.patientName || fallback;
  }
  return String(value);
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleString();
};

export default function ManageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [releasingId, setReleasingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Admin login nahi hai. Please login again.");
      }

      const response = await fetch(`${API}/reports/admin/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `Request failed (${response.status})`
        );
      }

      // Backend may return reports in either property.
      const list = Array.isArray(data.reports)
        ? data.reports
        : Array.isArray(data.data)
        ? data.data
        : [];

      setReports(list);
    } catch (err) {
      setError(err.message || "Reports load nahi ho paaye.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleRelease = async (report) => {
    const reportId = getId(report._id || report.id);

    if (!reportId) {
      setError("Report ID nahi mili. Backend response check karein.");
      return;
    }

    if (
      !window.confirm(
        "Kya aap is report ko customer ke liye release karna chahte hain?"
      )
    ) {
      return;
    }

    setReleasingId(reportId);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Admin login nahi hai. Please login again.");
      }

      const response = await fetch(
        `${API}/reports/${reportId}/release`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Report release nahi hui."
        );
      }

      setMessage(data.message || "Report successfully released.");
      await fetchReports();
    } catch (err) {
      setError(err.message || "Report release karne mein error aaya.");
    } finally {
      setReleasingId("");
    }
  };

  const getStatus = (status) =>
    String(status || "unknown").toLowerCase();

  const canRelease = (status) =>
    ["uploaded", "verified"].includes(getStatus(status));

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="mb-1">Manage Reports</h2>
          <p className="text-muted mb-0">
            Review uploaded reports and release them to customers.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={fetchReports}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0">Reports load ho rahi hain...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="alert alert-info">
          Koi uploaded ya verified report nahi mili.
          <br />
          Agar report MongoDB mein hai, to Admin Reports API aur login token
          check karein.
        </div>
      ) : (
        <>
          <div className="mb-3 text-muted">
            Total pending reports: <strong>{reports.length}</strong>
          </div>

          <div className="row g-3">
            {reports.map((report) => {
              const reportId = getId(report._id || report.id);
              const status = getStatus(report.status);
              const isReleasing = releasingId === reportId;

              return (
                <div
                  className="col-12 col-lg-6"
                  key={reportId || `${report.booking}-${report.test}`}
                >
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <h5 className="card-title mb-0">
                          {getName(report.test, "Test report")}
                        </h5>

                        <span
                          className={`badge ${
                            status === "verified"
                              ? "bg-info text-dark"
                              : status === "uploaded"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="mb-2">
                        <strong>Customer:</strong>{" "}
                        {getName(report.customer)}
                      </p>

                      {report.customer?.email && (
                        <p className="mb-2">
                          <strong>Email:</strong> {report.customer.email}
                        </p>
                      )}

                      {report.customer?.phone && (
                        <p className="mb-2">
                          <strong>Phone:</strong> {report.customer.phone}
                        </p>
                      )}

                      <p className="mb-2">
                        <strong>Lab:</strong> {getName(report.lab)}
                      </p>

                      <p className="mb-2">
                        <strong>Booking:</strong>{" "}
                        {getId(report.booking) || "N/A"}
                      </p>

                      <p className="mb-2">
                        <strong>Uploaded:</strong>{" "}
                        {formatDate(report.uploadedAt || report.createdAt)}
                      </p>

                      <p className="mb-3">
                        <strong>Remarks:</strong>{" "}
                        {report.remarks || "No remarks"}
                      </p>

                      <div className="d-flex flex-wrap gap-2">
                        {canRelease(status) ? (
                          <button
                            type="button"
                            className="btn btn-success"
                            disabled={isReleasing || !reportId}
                            onClick={() => handleRelease(report)}
                          >
                            {isReleasing
                              ? "Releasing..."
                              : "Release to Customer"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            disabled
                          >
                            {status === "released"
                              ? "Already Released"
                              : "Cannot Release"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
