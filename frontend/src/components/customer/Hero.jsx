import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, MapPin, Search, ShieldCheck, House, CheckCircle2
} from "lucide-react";

export default function Hero() {
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  function checkPin(event) {
    event.preventDefault();

    if (!/^\d{6}$/.test(pin)) {
      setMessage("Please enter a valid 6-digit PIN code.");
      return;
    }

    setMessage(
      "PIN code entered. Live availability will be confirmed once verified service areas are configured."
    );
  }

  return (
    <section className="hero-section">
      <div className="hero-orb orb-one" />
      <div className="hero-orb orb-two" />

      <div className="page-container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            YOUR LOCAL HEALTHCARE COMPANION
          </div>

          <h1>
            Healthcare testing,
            <span> made simpler.</span>
          </h1>

          <p className="hero-description">
            Explore diagnostic tests, compare available lab prices and
            request convenient home sample collection across Sitamarhi.
          </p>

          <div className="hero-benefits">
            <span><CheckCircle2 size={17} /> Compare lab prices</span>
            <span><CheckCircle2 size={17} /> Home collection</span>
            <span><CheckCircle2 size={17} /> Private reports</span>
          </div>

          <form className="pin-card" onSubmit={checkPin}>
            <label htmlFor="pin">
              <MapPin size={18} /> Check your PIN code
            </label>
            <div className="pin-input-row">
              <input
                id="pin"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                value={pin}
                onChange={(event) => {
                  setPin(event.target.value.replace(/\D/g, ""));
                  setMessage("");
                }}
                placeholder="Enter 6-digit PIN"
              />
              <button className="btn btn-brand" type="submit">
                Check <ArrowRight size={17} />
              </button>
            </div>
            {message && <p className="pin-message" role="status">{message}</p>}
          </form>

          <div className="hero-trust">
            <ShieldCheck size={17} />
            Service availability depends on your area.
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-frame">
            <img
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85"
              alt="Healthcare professional in a clinical environment"
              fetchPriority="high"
            />
            <div className="hero-image-gradient" />
            <div className="hero-image-caption">
              <span className="caption-icon"><ShieldCheck size={22} /></span>
              <span>
                <strong>Care you can plan for</strong>
                <small>Clear choices, convenient booking</small>
              </span>
            </div>
          </div>

          <div className="floating-card float-top">
            <span className="floating-icon"><ShieldCheck size={23} /></span>
            <span>
              <strong>Verified partners</strong>
              <small>After approval</small>
            </span>
          </div>

          <div className="floating-card float-bottom">
            <span className="floating-icon floating-icon-blue"><House size={23} /></span>
            <span>
              <strong>Home collection</strong>
              <small>Where available</small>
            </span>
          </div>
        </div>
      </div>

      <div className="page-container hero-stats">
        <div><ShieldCheck /><span><strong>Verified listings</strong><small>Approved partner labs</small></span></div>
        <div><Search /><span><strong>Compare options</strong><small>Review before booking</small></span></div>
        <div><House /><span><strong>Home collection</strong><small>In active service areas</small></span></div>
        <div><MapPin /><span><strong>Sitamarhi focused</strong><small>Local service coverage</small></span></div>
      </div>
    </section>
  );
}