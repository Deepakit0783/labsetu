
import { useEffect, useState } from "react";
import { UserRound, Mail, Phone, MapPin } from "lucide-react";

const API_URL = "http://localhost:5000/api/auth/profile";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    pinCode: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  function update(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);
  }

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        showMessage("Please login to view your profile.", "error");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile");
        }

        const user = data.user;

        setProfile({
          name: user.name || "",
          email: user.email || "",
          mobile: user.phone || user.mobile || "",
          pinCode: user.pinCode || "",
          address: user.address || "",
        });

        // Keep the basic user details used elsewhere in the app in sync.
        const storedUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            id: user.id || storedUser.id,
            name: user.name,
            email: user.email,
            phone: user.phone || user.mobile || "",
            role: user.role,
          })
        );
      } catch (error) {
        showMessage(error.message || "Something went wrong.", "error");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      showMessage("Please login before saving your profile.", "error");
      return;
    }

    if (!/^[A-Za-z0-9\s.'-]{2,100}$/.test(profile.name.trim())) {
      showMessage("Please enter a valid name.", "error");
      return;
    }

    if (!/^\d{10}$/.test(profile.mobile)) {
      showMessage("Mobile number must contain 10 digits.", "error");
      return;
    }

    if (profile.pinCode && !/^\d{6}$/.test(profile.pinCode)) {
      showMessage("PIN code must contain 6 digits.", "error");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name.trim(),
          phone: profile.mobile,
          pinCode: profile.pinCode,
          address: profile.address.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save profile.");
      }

      const user = data.user;

      setProfile({
        name: user.name || "",
        email: user.email || "",
        mobile: user.phone || user.mobile || "",
        pinCode: user.pinCode || "",
        address: user.address || "",
      });

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          id: user.id || storedUser.id,
          name: user.name,
          email: user.email,
          phone: user.phone || user.mobile || "",
          role: user.role,
        })
      );

      showMessage(data.message || "Profile saved successfully!");
    } catch (error) {
      showMessage(error.message || "Unable to save profile.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="inner-page">
      <section className="inner-page-hero">
        <div className="page-container">
          <span className="section-kicker">YOUR ACCOUNT</span>
          <h1>Profile details</h1>
          <p>Manage your contact information and collection address.</p>
        </div>
      </section>

      <section className="page-container catalogue-content">
        <form
          className="booking-form-card profile-form"
          onSubmit={submit}
        >
          <div className="profile-heading">
            <span className="auth-brand-icon">
              <UserRound size={27} />
            </span>
            <div>
              <h2>Your information</h2>
              <p>Your saved details are linked to your account.</p>
            </div>
          </div>

          {loading ? (
            <p role="status">Loading your profile...</p>
          ) : (
            <>
              <div className="booking-fields">
                <div className="booking-field">
                  <label htmlFor="profile-name">Full name</label>
                  <input
                    id="profile-name"
                    value={profile.name}
                    required
                    minLength={2}
                    maxLength={100}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Full name"
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor="profile-email">Email</label>
                  <div className="profile-input-icon">
                    <Mail size={17} />
                    <input
                      id="profile-email"
                      type="email"
                      value={profile.email}
                      readOnly
                      aria-readonly="true"
                    />
                  </div>
                </div>

                <div className="booking-field">
                  <label htmlFor="profile-mobile">Mobile number</label>
                  <div className="profile-input-icon">
                    <Phone size={17} />
                    <input
                      id="profile-mobile"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={profile.mobile}
                      required
                      onChange={(e) =>
                        update(
                          "mobile",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      placeholder="10-digit mobile"
                    />
                  </div>
                </div>

                <div className="booking-field">
                  <label htmlFor="profile-pin">PIN code</label>
                  <input
                    id="profile-pin"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={profile.pinCode}
                    onChange={(e) =>
                      update(
                        "pinCode",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="6-digit PIN code"
                  />
                </div>

                <div className="booking-field full">
                  <label htmlFor="profile-address">Address</label>
                  <div className="profile-input-icon profile-textarea-icon">
                    <MapPin size={17} />
                    <textarea
                      id="profile-address"
                      rows={3}
                      maxLength={500}
                      value={profile.address}
                      onChange={(e) =>
                        update("address", e.target.value)
                      }
                      placeholder="Your full address"
                    />
                  </div>
                </div>
              </div>

              <button
                className="btn btn-brand mt-4"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </>
          )}

          {message && (
            <p
              className="auth-message"
              role="status"
              style={{
                color: messageType === "error" ? "#dc2626" : "#15803d",
              }}
            >
              {message}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
