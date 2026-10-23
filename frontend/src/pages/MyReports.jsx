
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  LockKeyhole,
  ArrowRight,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API = "http://localhost:5000/api";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const getId = (value) =>
  value && typeof value === "object"
    ? value._id || value.id || ""
    : value || "";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to view your reports.");
      }

      const response = await fetch(`${API}/reports/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to load reports (${response.status}).`
        );
      }

      // Supports either { data: [...] } or { reports: [...] }.
      const list = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.reports)
          ? data.reports
          : [];

      setReports(list);
    } catch (err) {
      setError(err.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const downloadReport = async (report) => {
    const reportId = getId(report);

    if (!reportId) {
      setError("Invalid report ID.");
      return;
    }

    setDownloadingId(reportId);
    setError("");
    setNotice("");

    let objectUrl = "";

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API}/reports/${reportId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.message || `Download failed (${response.status}).`
        );
      }

      const blob = await response.blob();
      objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      const testName = (report.test?.name || "lab-report")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
        .trim();

      link.href = objectUrl;
      link.download = `${testName || "lab-report"}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setNotice("Report download started.");
    } catch (err) {
      setError(err.message || "Unable to download report.");
    } finally {
      if (objectUrl) {
        window.setTimeout(() => {
          window.URL.revokeObjectURL(objectUrl);
        }, 1000);
      }

      setDownloadingId("");
    }
  };

  return (
    <main className="inner-page">
      <section className="inner-page-hero">
        <div className="page-container">
          <span className="section-kicker">PRIVATE HEALTH RECORDS</span>
          <h1>My reports</h1>
          <p>Access reports released by your selected laboratory.</p>
        </div>
      </section>

      <section className="page-container catalogue-content">
        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 15px",
              marginBottom: 16,
              borderRadius: 8,
              background: "#fff1f2",
              color: "#be123c",
              overflowWrap: "anywhere",
            }}
          >
            <AlertCircle
              size={17}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            style={{
              padding: "12px 15px",
              marginBottom: 16,
              borderRadius: 8,
              background: "#ecfdf5",
              color: "#047857",
            }}
          >
            <CheckCircle2
              size={17}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />
            {notice}
          </div>
        )}

        {loading ? (
          <div className="catalog-empty">
            <RefreshCw size={30} />
            <h2>Loading reports...</h2>
            <p>Please wait while we retrieve your released reports.</p>
          </div>
        ) : reports.length === 0 && !error ? (
          <div className="catalog-empty">
            <span className="empty-icon">
              <FileText size={32} />
            </span>
            <h2>No reports available</h2>
            <p>
              Your reports will appear here after the laboratory uploads
              them and the admin releases them.
            </p>
            <p>
              <LockKeyhole
                size={15}
                style={{ verticalAlign: "middle", marginRight: 5 }}
              />
              Your medical reports should remain private.
            </p>

            <Link to="/bookings" className="btn btn-brand">
              View bookings <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 5px" }}>Your released reports</h2>
                <p style={{ margin: 0, color: "#64748b" }}>
                  {reports.length} report{reports.length === 1 ? "" : "s"} available
                </p>
              </div>

              <button
                type="button"
                className="btn btn-brand"
                onClick={loadReports}
                disabled={loading}
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {reports.map((report) => {
                const reportId = getId(report);

                return (
                  <article
                    key={reportId}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5eaf1",
                      borderRadius: 12,
                      padding: 20,
                      boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div>
                        <h3 style={{ margin: "0 0 8px" }}>
                          <FileText
                            size={19}
                            style={{
                              verticalAlign: "middle",
                              marginRight: 7,
                            }}
                          />
                          {report.test?.name || "Lab test report"}
                        </h3>

                        <p style={{ margin: "5px 0", color: "#64748b" }}>
                          Laboratory: {report.lab?.name || "—"}
                        </p>

                        <p style={{ margin: "5px 0", color: "#64748b" }}>
                          Uploaded: {formatDate(report.uploadedAt || report.createdAt)}
                        </p>

                        {report.booking?.patientName && (
                          <p style={{ margin: "5px 0", color: "#64748b" }}>
                            Patient: {report.booking.patientName}
                          </p>
                        )}
                      </div>

                      <span
                        style={{
                          background: "#ecfdf5",
                          color: "#047857",
                          borderRadius: 30,
                          padding: "6px 11px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2
                          size={14}
                          style={{ verticalAlign: "middle", marginRight: 4 }}
                        />
                        RELEASED
                      </span>
                    </div>

                    {report.remarks && (
                      <p style={{ marginTop: 12, color: "#475569" }}>
                        <strong>Remarks:</strong> {report.remarks}
                      </p>
                    )}

                    <button
                      type="button"
                      className="btn btn-brand"
                      onClick={() => downloadReport(report)}
                      disabled={downloadingId === reportId}
                      style={{ marginTop: 12 }}
                    >
                      {downloadingId === reportId ? (
                        <RefreshCw size={17} />
                      ) : (
                        <Download size={17} />
                      )}
                      {downloadingId === reportId
                        ? "Downloading..."
                        : "Download PDF"}
                    </button>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <p style={{ marginTop: 22, color: "#64748b", fontSize: 13 }}>
          <LockKeyhole
            size={14}
            style={{ verticalAlign: "middle", marginRight: 5 }}
          />
          Reports are available only to their authorised customer.
        </p>
      </section>
    </main>
  );
}
