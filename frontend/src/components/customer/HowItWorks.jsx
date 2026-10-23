import { Search, CalendarCheck, House, ClipboardCheck } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Choose a test",
    text: "Explore tests and compare available partner labs."
  },
  {
    icon: CalendarCheck,
    number: "02",
    title: "Book a slot",
    text: "Choose a date and an available collection time."
  },
  {
    icon: House,
    number: "03",
    title: "Sample collection",
    text: "The assigned collection professional visits your address."
  },
  {
    icon: ClipboardCheck,
    number: "04",
    title: "Access your report",
    text: "View your report securely after the lab releases it."
  }
];

export default function HowItWorks() {
  return (
    <div className="steps-grid">
      {steps.map(({ icon: Icon, number, title, text }) => (
        <article className="step-card" key={number}>
          <div className="step-top">
            <span className="step-icon"><Icon size={25} /></span>
            <span className="step-number">{number}</span>
          </div>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}