import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function TestCategoryCard({ item }) {
  const Icon = item.icon;

  return (
    <Link to="/tests" className="category-card">
      <span className={`category-icon ${item.color}`}>
        <Icon size={25} strokeWidth={1.8} />
      </span>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <span className="category-arrow">
        <ChevronRight size={19} />
      </span>
    </Link>
  );
}