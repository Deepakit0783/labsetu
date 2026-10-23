
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Search,
  RefreshCw,
  UserRound,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function ManagementPage({
  eyebrow = "WORKSPACE",
  title,
  description,
  backTo,
  backLabel = "Back to dashboard",
  columns = [],
  note = "Records will appear here after the backend is connected.",
  resource = "",
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");

  const isUsersPage = resource === "users";

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Login token nahi mila. Admin account se dobara login karein.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Users load nahi ho sake.");
      }

      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      setError(err.message || "Users load karte waqt error aaya.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUsersPage) {
      fetchUsers();
    }
  }, [isUsersPage]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        [user.name, user.email, user.phone, user.role]
          .some((value) => String(value || "").toLowerCase().includes(term));

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const updateStatus = async (user) => {
    const nextStatus = !user.isActive;
    const action = nextStatus ? "activate" : "deactivate";

    if (
      !window.confirm(
        `Kya aap ${user.name} ka account ${action} karna chahte hain?`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Login token nahi mila. Dobara login karein.");
      return;
    }

    setUpdatingId(user._id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${user._id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: nextStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Account status update nahi hua.");
      }

      setUsers((previous) =>
        previous.map((item) =>
          item._id === user._id
            ? { ...item, isActive: data.user?.isActive ?? nextStatus }
            : item
        )
      );

      setMessage(data.message || "Account status update ho gaya.");
    } catch (err) {
      setError(err.message || "Account update karte waqt error aaya.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="management-page">
      <Link to={backTo || "/admin"} className="text-link management-back">
        <ArrowLeft size={17} />
        {backLabel}
      </Link>

      <div className="dashboard-welcome management-welcome">
        <div>
          <span className="section-kicker">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      {isUsersPage ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
              marginBottom: 22,
            }}
          >
            {[
              {
                label: "Total accounts",
                value: users.length,
                icon: <UserRound size={22} />,
              },
              {
                label: "Active accounts",
                value: users.filter((user) => user.isActive).length,
                icon: <ShieldCheck size={22} />,
              },
              {
                label: "Inactive accounts",
                value: users.filter((user) => !user.isActive).length,
                icon: <ShieldOff size={22} />,
              },
            ].map((stat) => (
              <section
                className="dashboard-panel"
                key={stat.label}
                style={{ padding: 20 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span>{stat.label}</span>
                  {stat.icon}
                </div>
                <h2 style={{ fontSize: 30, marginTop: 14 }}>{stat.value}</h2>
              </section>
            ))}
          </div>

          <section className="dashboard-panel management-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>User accounts</h2>
                <p>{note}</p>
              </div>

              <button
                type="button"
                onClick={fetchUsers}
                disabled={loading}
                className="text-link"
              >
                <RefreshCw size={16} />
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                margin: "18px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flex: "1 1 240px",
                  border: "1px solid #dce5df",
                  borderRadius: 10,
                  padding: "0 12px",
                }}
              >
                <Search size={18} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, phone..."
                  aria-label="Search users"
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    padding: "12px 0",
                    background: "transparent",
                  }}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Filter users by role"
                style={{
                  minWidth: 160,
                  border: "1px solid #dce5df",
                  borderRadius: 10,
                  padding: "10px 12px",
                  background: "#fff",
                }}
              >
                <option value="all">All roles</option>
                <option value="customer">Customer</option>
                <option value="agent">Agent</option>
                <option value="lab">Lab</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  padding: 12,
                  marginBottom: 14,
                  borderRadius: 8,
                  background: "#fff0f0",
                  color: "#a32020",
                }}
              >
                {error}
              </div>
            )}

            {message && (
              <div
                role="status"
                style={{
                  padding: 12,
                  marginBottom: 14,
                  borderRadius: 8,
                  background: "#e9f8ef",
                  color: "#126b3b",
                }}
              >
                {message}
              </div>
            )}

            <div className="management-table-wrap">
              <table className="management-table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading && users.length === 0 ? (
                    <tr>
                      <td colSpan={Math.max(columns.length, 1)}>
                        <div className="dashboard-empty-state">
                          <RefreshCw size={25} />
                          <strong>Loading users...</strong>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={Math.max(columns.length, 1)}>
                        <div className="dashboard-empty-state">
                          <ClipboardList size={27} />
                          <strong>
                            {users.length === 0
                              ? "No users found"
                              : "No matching users"}
                          </strong>
                          <span>
                            {users.length === 0
                              ? "Registered accounts yahan dikhai denge."
                              : "Search ya role filter change karke dekhein."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <strong>{user.name || "—"}</strong>
                          <div
                            style={{
                              fontSize: 12,
                              opacity: 0.7,
                              marginTop: 4,
                            }}
                          >
                            ID: {user._id}
                          </div>
                        </td>

                        <td>
                          <span className="management-role">
                            {user.role || "customer"}
                          </span>
                        </td>

                        <td>
                          <div>{user.email || "—"}</div>
                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                            {user.phone || "Phone not provided"}
                          </div>
                        </td>

                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              borderRadius: 20,
                              padding: "5px 10px",
                              fontSize: 12,
                              fontWeight: 600,
                              background: user.isActive ? "#e6f7ed" : "#fff0f0",
                              color: user.isActive ? "#137342" : "#a32020",
                            }}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            disabled={updatingId === user._id}
                            onClick={() => updateStatus(user)}
                            style={{
                              border: "1px solid #dce5df",
                              borderRadius: 8,
                              padding: "8px 10px",
                              cursor:
                                updatingId === user._id
                                  ? "wait"
                                  : "pointer",
                              opacity: updatingId === user._id ? 0.6 : 1,
                              background: "#fff",
                            }}
                          >
                            {updatingId === user._id
                              ? "Updating..."
                              : user.isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p style={{ marginTop: 14, fontSize: 13, opacity: 0.7 }}>
              Showing {filteredUsers.length} of {users.length} accounts
            </p>
          </section>
        </>
      ) : (
        <section className="dashboard-panel management-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Records</h2>
              <p>{note}</p>
            </div>
          </div>

          <div className="management-table-wrap">
            <table className="management-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={Math.max(columns.length, 1)}>
                    <div className="dashboard-empty-state">
                      <ClipboardList size={27} />
                      <strong>No records available</strong>
                      <span>
                        This is a frontend placeholder, not live platform data.
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
