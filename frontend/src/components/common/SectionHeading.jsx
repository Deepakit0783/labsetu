export default function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false
}) {
  return (
    <div className={`section-heading ${centered ? "center-heading" : ""}`}>
      <div>
        {eyebrow && <span className="section-kicker">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}