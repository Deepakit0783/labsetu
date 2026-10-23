import { Link } from "react-router-dom";
import {
  Droplets, Activity, HeartPulse, FlaskConical,
  Microscope, TestTube2, ArrowRight, CheckCircle2,
  LockKeyhole, BadgeCheck, House
} from "lucide-react";

import Hero from "../components/customer/Hero";
import SectionHeading from "../components/common/SectionHeading";
import TestCategoryCard from "../components/customer/TestCategoryCard";
import HowItWorks from "../components/customer/HowItWorks";

const categories = [
  {
    name: "Blood Tests",
    description: "Common blood investigations",
    icon: Droplets,
    color: "icon-mint"
  },
  {
    name: "Diabetes",
    description: "Blood sugar and HbA1c",
    icon: Activity,
    color: "icon-blue"
  },
  {
    name: "Thyroid",
    description: "Thyroid function tests",
    icon: HeartPulse,
    color: "icon-lilac"
  },
  {
    name: "Health Packages",
    description: "Explore available checkups",
    icon: FlaskConical,
    color: "icon-peach"
  },
  {
    name: "Vitamin Tests",
    description: "Vitamin D and B12 tests",
    icon: Microscope,
    color: "icon-blue"
  },
  {
    name: "Other Tests",
    description: "Browse the test catalogue",
    icon: TestTube2,
    color: "icon-mint"
  }
];

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="section-spacing" id="tests">
        <div className="page-container">
          <div className="section-heading-row">
            <SectionHeading
              eyebrow="EXPLORE TESTS"
              title="Find what you need"
              description="Start with a category and explore the available tests."
            />
            <Link to="/tests" className="text-link desktop-section-link">
              Browse all tests <ArrowRight size={17} />
            </Link>
          </div>

          <div className="category-grid">
            {categories.map((item) => (
              <TestCategoryCard item={item} key={item.name} />
            ))}
          </div>

          <Link to="/tests" className="mobile-browse-link">
            Browse all tests <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="comparison-section">
        <div className="page-container comparison-grid">
          <div className="comparison-copy">
            <span className="section-kicker">YOUR CHOICE MATTERS</span>
            <h2>Compare labs before you book.</h2>
            <p>
              Review approved test prices, collection charges, estimated
              turnaround times and availability before choosing a partner lab.
            </p>

            <div className="comparison-benefits">
              <div><CheckCircle2 /> Clear price breakdown</div>
              <div><CheckCircle2 /> Lab-specific availability</div>
              <div><CheckCircle2 /> Your chosen lab stays selected</div>
            </div>

            <Link to="/labs" className="btn btn-brand comparison-button">
              Explore lab options <ArrowRight size={18} />
            </Link>
          </div>

          <div className="comparison-preview">
            <div className="preview-heading">
              <div className="preview-heading-icon"><FlaskConical size={22} /></div>
              <div>
                <strong>Compare partner labs</strong>
                <small>Example of the future comparison view</small>
              </div>
            </div>

            <div className="preview-notice">
              Demo preview — no real partner labs or prices are represented.
            </div>

            {[
              { icon: Activity, name: "Partner Lab A", color: "icon-mint" },
              { icon: Microscope, name: "Partner Lab B", color: "icon-blue" },
              { icon: TestTube2, name: "Partner Lab C", color: "icon-peach" }
            ].map(({ icon: Icon, name, color }) => (
              <div className="preview-lab-row" key={name}>
                <span className={`preview-lab-icon ${color}`}><Icon size={21} /></span>
                <span className="preview-lab-name">
                  <strong>{name}</strong>
                  <small>Example listing</small>
                </span>
                <span className="price-placeholder">₹ —</span>
              </div>
            ))}

            <div className="preview-footer">
              <LockKeyhole size={15} />
              Only approved listings will be published.
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing" id="how-it-works">
        <div className="page-container">
          <SectionHeading
            eyebrow="SIMPLE BOOKING JOURNEY"
            title="How LabSetu works"
            description="Four steps from exploring a test to accessing your report."
            centered
          />
          <HowItWorks />
        </div>
      </section>

      <section className="why-section">
        <div className="page-container why-grid">
          <div className="why-visual">
            <img
              src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1000&q=85"
              alt="Healthcare professional in a clinical setting"
              loading="lazy"
            />
            <div className="why-image-caption">
              <BadgeCheck size={24} />
              <span>
                <strong>Transparency comes first</strong>
                <small>Information before confirmation</small>
              </span>
            </div>
          </div>

          <div className="why-copy">
            <span className="section-kicker">WHY LABSETU</span>
            <h2>Better visibility. More informed choices.</h2>
            <p>
              Our goal is to make it easier to discover diagnostic services
              in Sitamarhi, with transparent listings and convenient booking.
            </p>

            <div className="why-feature">
              <span><BadgeCheck /></span>
              <div>
                <h3>Transparent pricing</h3>
                <p>See approved test prices and applicable extra charges.</p>
              </div>
            </div>

            <div className="why-feature">
              <span><House /></span>
              <div>
                <h3>Convenient collection</h3>
                <p>Choose home collection when your area is serviceable.</p>
              </div>
            </div>

            <div className="why-feature">
              <span><LockKeyhole /></span>
              <div>
                <h3>Private reports</h3>
                <p>Reports should be available only to authorised users.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta-section">
        <div className="page-container">
          <div className="final-cta">
            <div className="cta-icon"><HeartPulse size={32} /></div>
            <div className="cta-copy">
              <h2>Your health journey starts here.</h2>
              <p>Explore tests and find services available in your area.</p>
            </div>
            <Link to="/tests" className="btn cta-button">
              Explore tests <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}