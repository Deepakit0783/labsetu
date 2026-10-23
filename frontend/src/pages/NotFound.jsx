import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="catalog-empty not-found-page">
      <span className="empty-icon"><Search size={32} /></span>
      <h1>404 — Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-brand">Return to Home</Link>
    </main>
  );
}