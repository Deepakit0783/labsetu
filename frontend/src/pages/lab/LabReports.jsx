
import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Upload,
  RefreshCw,
  FlaskConical,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API = "http://localhost:5000/api";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

export default function LabReports() {
  const [bookings, setBookings] = useState([]);
  const [files, setFiles] = useState({});
  const [testIds, setTestIds] = useState({});
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const requestBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in with your Lab Staff account.");
      }

      const response = await fetch(`${API}/bookings/lab/completed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to load bookings (${response.status}).`
        );
      }

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      setError(err.message || "Unable to load completed bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestBookings();
  }, [requestBookings]);

  const handleUpload = async (booking) => {
    const bookingId = booking._id;
    const file = files[bookingId];
    const testId = testIds[bookingId];

    setError("");
    setNotice("");

    if (!file) {
      setError("Please select a PDF report first.");
      return;
    }

    if (file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("PDF file must be 5 MB or smaller.");
      return;
    }

    if (!testId) {
      setError("Please select the test for this report.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("report", file);
    formData.append("testId", testId);
    formData.append("remarks", remarks[bookingId] || "");

    setUploadingId(bookingId);

    try {
      const response = await fetch(
        `${API}/reports/${bookingId}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Report upload failed.");
      }

      setNotice(
        data.message ||
          "Report uploaded successfully and is awaiting admin release."
      );

      setFiles((previous) => ({
        ...previous,
        [bookingId]: null,
      }));

      await requestBookings();
    } catch (err) {
      setError(err.message || "Report upload failed.");
    } finally {
      setUploadingId("");
    }
  };

  return (
    <div className="lab-reports-page">
      <style>{`
        .lab-reports-page {
          padding: 24px;
          color: #172033;
          box-sizing: border-box;
          width: 100%;
        }
        .lr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }
        .lr-header h1 {
          margin: 0 0 7px;
          font-size: 27px;
        }
        .lr-muted {
          color: #64748b;
          font-size: 14px;
        }
        .lr-refresh, .lr-button {
          border: 0;
          border-radius: 8px;
          padding: 10px 14px;
          font: inherit;
          cursor: pointer;
        }
        .lr-refresh {
          background: white;
          color: #172033;
          border: 1px solid #dbe2ea;
        }
        .lr-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #0f766e;
          color: white;
          font-weight: 600;
        }
        .lr-button:disabled, .lr-refresh:disabled {
          opacity: .55;
          cursor: not-allowed;
        }
        .lr-message {
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 16px;
          overflow-wrap: anywhere;
        }
        .lr-error { background: #fff1f2; color: #be123c; }
        .lr-success { background: #ecfdf5; color: #047857; }
        .lr-list {
          display: grid;
          gap: 16px;
        }
        .lr-card {
          background: white;
          border: 1px solid #e5eaf1;
          border-radius: 14px;
          padding: 20px;
        }
        .lr-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .lr-card h2 {
          font-size: 17px;
          margin: 0 0 6px;
          overflow-wrap: anywhere;
        }
        .lr-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 18px;
          margin-bottom: 14px;
          color: #475569;
          font-size: 13px;
        }
        .lr-tests {
          display: grid;
          gap: 8px;
          margin: 12px 0 16px;
        }
        .lr-test {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 14px;
        }
        .lr-form {
          border-top: 1px solid #edf0f5;
          padding-top: 16px;
          display: grid;
          gap: 12px;
        }
        .lr-form label {
          display: grid;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
        }
        .lr-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 11px;
          border: 1px solid #dbe2ea;
          border-radius: 8px;
          background: white;
          color: #172033;
          font: inherit;
        }
        .lr-empty {
          text-align: center;
          padding: 40px 20px;
          background: white;
          border: 1px solid #e5eaf1;
          border-radius: 14px;
          color: #64748b;
        }
        .lr-empty svg { margin-bottom: 10px; }
        @media (max-width: 700px) {
          .lab-reports-page { padding: 14px; }
          .lr-header h1 { font-size: 23px; }
          .lr-card { padding: 15px; }
        }
      `}</style>

      <div className="lr-header">
        <div>
          <h1>Test Reports</h1>
          <div className="lr-muted">
            Upload PDF reports for completed bookings. Reports remain private
            until an admin releases them.
          </div>
        </div>

        <button
          type="button"
          className="lr-refresh"
          onClick={requestBookings}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="lr-message lr-error" role="alert">
          <AlertCircle size={17} style={{ verticalAlign: "middle" }} /> {error}
        </div>
      )}

      {notice && (
        <div className="lr-message lr-success" role="status">
          <CheckCircle2 size={17} style={{ verticalAlign: "middle" }} />{" "}
          {notice}
        </div>
      )}

      {loading ? (
        <div className="lr-empty">Loading completed bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="lr-empty">
          <FileText size={34} />
          <h2>No completed bookings</h2>
          <p>
            Completed bookings assigned to your laboratory will appear here.
          </p>
        </div>
      ) : (
        <div className="lr-list">
          {bookings.map((booking) => {
            const bookingId = booking._id;
            const tests = Array.isArray(booking.tests) ? booking.tests : [];

            return (
              <section className="lr-card" key={bookingId}>
                <div className="lr-card-head">
                  <div>
                    <h2>
                      Booking #{String(bookingId).slice(-8).toUpperCase()}
                    </h2>
                    <div className="lr-muted">
                      Patient: {booking.patientName || "Patient"}
                    </div>
                  </div>

                  <span className="lr-muted">
                    Completed · {formatDate(booking.updatedAt || booking.createdAt)}
                  </span>
                </div>

                <div className="lr-meta">
                  <span>Lab: {booking.lab?.name || "Assigned lab"}</span>
                  <span>Booking date: {formatDate(booking.bookingDate)}</span>
                </div>

                <div className="lr-tests">
                  {tests.map((item, index) => {
                    const test = item.test;
                    const id =
                      typeof test === "object" ? test?._id : test;

                    return (
                      <label className="lr-test" key={id || index}>
                        <input
                          type="radio"
                          name={`test-${bookingId}`}
                          value={id || ""}
                          checked={(testIds[bookingId] || "") === (id || "")}
                          onChange={() =>
                            setTestIds((previous) => ({
                              ...previous,
                              [bookingId]: id || "",
                            }))
                          }
                        />
                        <FlaskConical size={16} />
                        {typeof test === "object"
                          ? test?.name || "Test"
                          : "Test"}
                      </label>
                    );
                  })}
                </div>

                <div className="lr-form">
                  <label>
                    PDF report (max 5 MB)
                    <input
                      className="lr-input"
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(event) => {
                        const selected = event.target.files?.[0] || null;
                        setFiles((previous) => ({
                          ...previous,
                          [bookingId]: selected,
                        }));
                      }}
                    />
                  </label>

                  <label>
                    Remarks (optional)
                    <textarea
                      className="lr-input"
                      rows={2}
                      maxLength={2000}
                      placeholder="Add report remarks if required"
                      value={remarks[bookingId] || ""}
                      onChange={(event) =>
                        setRemarks((previous) => ({
                          ...previous,
                          [bookingId]: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <div>
                    <button
                      type="button"
                      className="lr-button"
                      disabled={uploadingId === bookingId}
                      onClick={() => handleUpload(booking)}
                    >
                      <Upload size={17} />
                      {uploadingId === bookingId
                        ? "Uploading..."
                        : "Upload report"}
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
