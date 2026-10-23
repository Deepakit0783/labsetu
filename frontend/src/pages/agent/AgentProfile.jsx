import { useState } from "react";
import { Link } from "react-router-dom";
import { UserRound, Phone, MapPin } from "lucide-react";

export default function AgentProfile() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");

  function submit(event) {
    event.preventDefault();
    setMessage("Demo only: profile has not been saved to a server.");
  }

  return (
    <div className="management-page">
      <Link to="/agent" className="text-link management-back">
        Back to dashboard
      </Link>

      <div className="dashboard-welcome management-welcome">
        <div>
          <span className="section-kicker">YOUR ACCOUNT</span>
          <h1>Agent profile</h1>
          <p>Manage your contact details and assigned service area.</p>
        </div>
      </div>

      <form className="booking-form-card agent-profile-form" onSubmit={submit}>
        <div className="profile-heading">
          <span className="auth-brand-icon"><UserRound size={27} /></span>
          <div>
            <h2>Profile information</h2>
            <p>Changes are not saved until backend integration.</p>
          </div>
        </div>

        <div className="booking-fields">
          <div className="booking-field full">
            <label htmlFor="agent-name">Full name</label>
            <input id="agent-name" value={name} required
              onChange={(e) => setName(e.target.value)}
              placeholder="Agent name" />
          </div>

          <div className="booking-field">
            <label htmlFor="agent-mobile">Mobile number</label>
            <div className="profile-input-icon">
              <Phone size={17} />
              <input id="agent-mobile" value={mobile} required
                inputMode="numeric" pattern="[0-9]{10}" maxLength={10}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit number" />
            </div>
          </div>

          <div className="booking-field">
            <label htmlFor="agent-area">Service area</label>
            <div className="profile-input-icon">
              <MapPin size={17} />
              <input id="agent-area" value={area} required
                onChange={(e) => setArea(e.target.value)}
                placeholder="Assigned area" />
            </div>
          </div>
        </div>

        <button className="btn btn-brand mt-4" type="submit">
          Save demo details
        </button>

        {message && <p className="auth-message" role="status">{message}</p>}
      </form>
    </div>
  );
}