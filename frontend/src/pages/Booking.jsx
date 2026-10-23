
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  House,
  CreditCard,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function getTodayLocal() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Booking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [labs, setLabs] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  const requestedTest = params.get("test") || "";

  const [form, setForm] = useState({
    testId: "",
    labName: "",
    patientName: "",
    mobile: "",
    pinCode: "",
    address: "",
    city: "",
    state: "",
    date: "",
    time: "",
    payment: "cash",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [labsResponse, testsResponse] = await Promise.all([
          fetch(`${API_URL}/labs`),
          fetch(`${API_URL}/tests`),
        ]);

        const labsData = await labsResponse.json();
        const testsData = await testsResponse.json();

        if (!labsResponse.ok) {
          throw new Error(labsData.message || "Labs load nahi ho sake.");
        }

        if (!testsResponse.ok) {
          throw new Error(testsData.message || "Tests load nahi ho sake.");
        }

        const allLabs = Array.isArray(labsData)
          ? labsData
          : labsData.labs || [];

        const allTests = Array.isArray(testsData)
          ? testsData
          : testsData.tests || [];

        const activeLabs = allLabs.filter(
          (lab) => lab.isActive !== false
        );

        const activeTests = allTests.filter(
          (test) => test.isActive !== false
        );

        if (cancelled) return;

        setLabs(activeLabs);
        setTests(activeTests);

        if (requestedTest) {
          const matchedTest = activeTests.find(
            (test) =>
              test._id === requestedTest ||
              test.name?.toLowerCase() === requestedTest.toLowerCase()
          );

          if (matchedTest) {
            const testLabId =
              typeof matchedTest.lab === "object"
                ? matchedTest.lab?._id
                : matchedTest.lab || "";

            setForm((current) => ({
              ...current,
              testId: matchedTest._id,
              labName: testLabId || "",
            }));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Backend se connection nahi ho raha."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [requestedTest]);

  const selectedLab = labs.find(
    (lab) => lab._id === form.labName
  );

  const availableTests = tests.filter((test) => {
    if (!form.labName || !test.lab) return true;

    const testLabId =
      typeof test.lab === "object" ? test.lab._id : test.lab;

    return testLabId === form.labName;
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  }

  function handleLabChange(labId) {
    setForm((current) => {
      const selectedTest = tests.find(
        (test) => test._id === current.testId
      );

      const testLabId =
        typeof selectedTest?.lab === "object"
          ? selectedTest.lab?._id
          : selectedTest?.lab;

      const testStillAvailable =
        !selectedTest || !selectedTest.lab || testLabId === labId;

      return {
        ...current,
        labName: labId,
        testId: testStillAvailable ? current.testId : "",
      };
    });

    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Booking karne ke liye pehle customer account se login karein.");
      return;
    }

    if (
      !form.patientName.trim() ||
      !/^[0-9]{10}$/.test(form.mobile.trim())
    ) {
      setError("Valid patient name aur 10-digit mobile number enter karein.");
      return;
    }

    if (!selectedLab) {
      setError("Please ek lab select karein.");
      return;
    }

    if (!form.testId) {
      setError("Please ek test select karein.");
      return;
    }

    if (!form.date || form.date < getTodayLocal()) {
      setError("Aaj ya future ki date select karein.");
      return;
    }

    if (
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !/^[1-9][0-9]{5}$/.test(form.pinCode.trim())
    ) {
      setError("Complete address, city, state aur valid 6-digit PIN code enter karein.");
      return;
    }

    const selectedTest = tests.find(
      (test) => test._id === form.testId
    );

    if (!selectedTest) {
      setError("Selected test available nahi hai.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientName: form.patientName.trim(),
          mobile: form.mobile.trim(),
          lab: form.labName,
          tests: [form.testId],
          bookingDate: new Date(
            `${form.date}T12:00:00`
          ).toISOString(),
          collectionType: "home",
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pinCode.trim(),
          paymentMethod: form.payment,
          notes: `Preferred time: ${form.time}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            data.message ||
              "Login expire ho gaya hai ya customer account se login nahi hai."
          );
        }

        throw new Error(
          data.message || "Booking create nahi ho saki."
        );
      }

      setBooking(data.booking || data);
    } catch (err) {
      setError(
        err.message || "Booking save nahi hui. Backend check karein."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (booking) {
    return (
      <main className="auth-page">
        <section className="catalog-empty booking-result">
          <span className="empty-icon">
            <CheckCircle2 size={34} />
          </span>

          <h1>Booking Request Submitted!</h1>
          <p>
            Aapki booking save ho gayi hai. Lab confirmation pending
            ho sakti hai.
          </p>

          {booking._id && (
            <p>
              <strong>Booking ID:</strong> {booking._id}
            </p>
          )}

          {booking.bookingStatus && (
            <p>
              <strong>Status:</strong> {booking.bookingStatus}
            </p>
          )}

          <p>
            <strong>Patient:</strong> {form.patientName}
          </p>

          <p>
            <strong>Lab:</strong> {selectedLab?.name || "Selected lab"}
          </p>

          <p>
            <strong>Test:</strong>{" "}
            {tests.find((test) => test._id === form.testId)?.name}
          </p>

          <button
            className="btn btn-brand"
            onClick={() => navigate("/")}
          >
            Return Home
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="inner-page booking-page">
      <section className="inner-page-hero">
        <div className="page-container">
          <Link to="/tests" className="text-link">
            <ArrowLeft size={17} /> Back to tests
          </Link>

          <h1 className="mt-3">Request a home collection</h1>
          <p>Enter your details and preferred collection time.</p>
        </div>
      </section>

      <section className="page-container booking-grid">
        <form className="booking-form-card" onSubmit={submit}>
          <h2>Booking details</h2>

          {error && (
            <div
              role="alert"
              style={{
                color: "#b42318",
                background: "#fef3f2",
                border: "1px solid #fecdca",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "16px",
              }}
            >
              {error}{" "}
              {!localStorage.getItem("token") && (
                <Link to="/login">Login here</Link>
              )}
            </div>
          )}

          {loading ? (
            <p>
              <LoaderCircle
                size={18}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: "8px",
                }}
              />
              Labs aur tests load ho rahe hain...
            </p>
          ) : (
            <>
              <div className="booking-fields">
                <div className="booking-field full">
                  <label htmlFor="testName">Select test</label>
                  <select
                    id="testName"
                    value={form.testId}
                    required
                    onChange={(e) => update("testId", e.target.value)}
                  >
                    <option value="">Select a test</option>
                    {availableTests.map((test) => (
                      <option key={test._id} value={test._id}>
                        {test.name} — ₹{test.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="booking-field full">
                  <label htmlFor="labName">Preferred partner lab</label>
                  <select
                    id="labName"
                    value={form.labName}
                    required
                    onChange={(e) => handleLabChange(e.target.value)}
                  >
                    <option value="">Select a verified lab</option>
                    {labs.map((lab) => (
                      <option key={lab._id} value={lab._id}>
                        {lab.name}{lab.city ? ` — ${lab.city}` : ""}
                      </option>
                    ))}
                  </select>

                  {labs.length === 0 && (
                    <small>No active lab is available.</small>
                  )}
                </div>

                <div className="booking-field">
                  <label htmlFor="patientName">Patient name</label>
                  <input
                    id="patientName"
                    value={form.patientName}
                    required
                    maxLength={100}
                    onChange={(e) => update("patientName", e.target.value)}
                    autoComplete="name"
                    placeholder="Full name"
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor="mobile">Mobile number</label>
                  <input
                    id="mobile"
                    type="tel"
                    value={form.mobile}
                    required
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    onChange={(e) =>
                      update("mobile", e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="10-digit number"
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor="pinCode">PIN code</label>
                  <input
                    id="pinCode"
                    value={form.pinCode}
                    required
                    inputMode="numeric"
                    pattern="[1-9][0-9]{5}"
                    maxLength={6}
                    onChange={(e) =>
                      update("pinCode", e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="6-digit PIN code"
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor="date">Preferred date</label>
                  <input
                    id="date"
                    type="date"
                    required
                    min={getTodayLocal()}
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor="time">Preferred time</label>
                  <select
                    id="time"
                    required
                    value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                  >
                    <option value="">Select time</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                  </select>
                </div>

                <div className="booking-field">
                  <label htmlFor="city">City / District</label>
                  <input
                    id="city"
                    value={form.city}
                    required
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Enter city or district"
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    value={form.state}
                    required
                    onChange={(e) => update("state", e.target.value)}
                    placeholder="Enter state"
                  />
                </div>

                <div className="booking-field full">
                  <label htmlFor="address">Full collection address</label>
                  <textarea
                    id="address"
                    rows="3"
                    required
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="House, street, village/locality"
                  />
                </div>
              </div>

              <h2 className="booking-subheading">Payment preference</h2>

              <div className="payment-options">
                <label
                  className={`payment-option ${
                    form.payment === "cash" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={form.payment === "cash"}
                    onChange={(e) => update("payment", e.target.value)}
                  />
                  <Wallet size={22} />
                  <span>
                    <strong>Cash</strong>
                    <small>Payment on collection, if supported</small>
                  </span>
                </label>

                <label
                  className={`payment-option ${
                    form.payment === "online" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={form.payment === "online"}
                    onChange={(e) => update("payment", e.target.value)}
                  />
                  <CreditCard size={22} />
                  <span>
                    <strong>Online</strong>
                    <small>Payment gateway integration pending</small>
                  </span>
                </label>
              </div>

              {form.testId && (
                <p>
                  <strong>Test price:</strong> ₹
                  {tests.find((test) => test._id === form.testId)?.price ?? 0}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-brand booking-submit"
                disabled={submitting || loading || !labs.length || !tests.length}
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={18} />
                    Saving booking...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <CalendarDays size={18} />
                  </>
                )}
              </button>

              <p className="booking-disclaimer">
                Booking backend mein save hogi. Online payment gateway
                abhi connected nahi hai.
              </p>
            </>
          )}
        </form>

        <aside className="booking-side-card">
          <span className="detail-side-icon">
            <House size={24} />
          </span>

          <h3>Home collection</h3>
          <p>
            Collection lab aur service-area availability par depend
            karegi. Booking submit hone ke baad confirmation pending ho
            sakti hai.
          </p>

          <div className="booking-side-rule" />

          <span className="detail-side-icon">
            <MapPin size={24} />
          </span>

          <h3>Service area</h3>
          <p>Apna sahi city, state aur PIN code enter karein.</p>
        </aside>
      </section>
    </main>
  );
}
