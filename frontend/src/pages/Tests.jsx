
import { useEffect, useMemo, useState } from "react";
import { Search, FlaskConical, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  "All Tests",
  "Blood Tests",
  "Diabetes",
  "Thyroid",
  "Vitamin Tests",
  "Health Packages",
];

const API_URL = "http://localhost:5000/api/tests";

export default function Tests() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Tests");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Tests load nahi ho paaye.");
        }

        setTests(Array.isArray(data.tests) ? data.tests : []);
      } catch (err) {
        setError(err.message || "Backend se connection nahi ho paaya.");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const results = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        (test.name || "")
          .toLowerCase()
          .includes(search.trim().toLowerCase());

      const testCategory = (test.category || "").toLowerCase();
      const selectedCategory = category.toLowerCase();

      const matchesCategory =
        category === "All Tests" ||
        testCategory.includes(selectedCategory.replace(" tests", ""));

      return matchesSearch && matchesCategory;
    });
  }, [tests, search, category]);

  return (
    <main className="inner-page">
      <section className="inner-page-hero">
        <div className="page-container">
          <span className="section-kicker">DIAGNOSTIC CATALOGUE</span>
          <h1>Find the right test for you.</h1>
          <p>Search tests and explore available diagnostic options.</p>

          <div className="catalog-search">
            <Search size={21} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by test name..."
              aria-label="Search tests"
            />
          </div>
        </div>
      </section>

      <section className="page-container catalogue-content">
        <div className="filter-chips">
          {categories.map((item) => (
            <button
              key={item}
              className={`filter-chip ${
                category === item ? "active" : ""
              }`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="catalog-empty">
            <p>Tests load ho rahe hain...</p>
          </div>
        ) : error ? (
          <div className="catalog-empty">
            <h2>Tests load nahi ho paaye</h2>
            <p>{error}</p>
            <button
              className="btn btn-brand"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="catalog-empty">
            <span className="empty-icon">
              <FlaskConical size={32} />
            </span>
            <h2>
              {tests.length === 0
                ? "No tests available yet"
                : `No tests found${search ? ` for "${search}"` : ""}`}
            </h2>
            <p>
              Search change karo ya doosri category select karke dekho.
              Active tests database mein available hone par yahan dikhenge.
            </p>
            <Link to="/" className="btn btn-brand">
              Back to Home <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="test-grid">
            {results.map((test) => (
              <article className="test-card" key={test._id}>
                <span className="empty-icon">
                  <FlaskConical size={26} />
                </span>

                <h2>{test.name}</h2>
                <p>{test.description || "Diagnostic test"}</p>

                <p>
                  <strong>Price: ₹{test.price}</strong>
                </p>

                {test.duration && <p>Duration: {test.duration}</p>}

                {test.category && <p>Category: {test.category}</p>}

                {test.lab && (
                  <p>
                    Laboratory: {test.lab.name}
                    {test.lab.city ? `, ${test.lab.city}` : ""}
                  </p>
                )}

                <Link
                  to={`/tests/${test._id}`}
                  className="btn btn-brand"
                >
                  View Details <ArrowRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
