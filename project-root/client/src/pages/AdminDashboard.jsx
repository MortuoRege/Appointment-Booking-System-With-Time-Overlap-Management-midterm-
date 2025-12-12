// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";

function AdminDashboard({ user }) {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load staff list once on mount
  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load staff");
      setStaff(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.role || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to create staff member");

      setSuccess(`Staff member "${data.name}" created.`);
      setForm({ name: "", role: "", email: "", password: "" });
      await loadStaff();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Delete this staff member? This will also remove their appointments."
    );
    if (!confirmDelete) return;

    try {
      setError("");
      setSuccess("");
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to delete staff member");

      setSuccess("Staff member deleted.");
      // remove from local state without full reload:
      setStaff((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner admin-inner">
        <div className="dashboard-header-row">
          <div>
            <h2 className="dashboard-title">Admin dashboard</h2>
            <p className="dashboard-subtitle">
              Manage staff accounts. Later you can extend this with an overview
              of all appointments.
            </p>
          </div>
          {user && (
            <div className="dashboard-badge">
              Admin: <span>{user.name}</span>
            </div>
          )}
        </div>

        <div className="admin-grid">
          {/* Left: create staff */}
          <section className="admin-card">
            <h3 className="admin-card-title">Add staff member</h3>
            <p className="admin-card-subtitle">
              Create staff accounts that clients can book appointments with.
            </p>

            {error && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="auth-input"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="role">
                    Role
                  </label>
                  <input
                    id="role"
                    name="role"
                    className="auth-input"
                    placeholder="Tutor / Dentist / Support..."
                    value={form.role}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="auth-input"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="auth-input"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-button admin-submit"
                disabled={saving}
              >
                {saving ? "Creating…" : "Create staff"}
              </button>
            </form>
          </section>

          {/* Right: staff list */}
          <section className="admin-card">
            <h3 className="admin-card-title">Staff members</h3>
            <p className="admin-card-subtitle">
              Total: {staff.length}{" "}
              {loading && <span className="admin-loading">Refreshing…</span>}
            </p>

            {staff.length === 0 && !loading && (
              <p className="admin-empty">
                No staff members yet. Create one on the left.
              </p>
            )}

            {staff.length > 0 && (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Email</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((member) => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>
                          <span className="tag-pill">{member.role}</span>
                        </td>
                        <td className="admin-email-cell">{member.email}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-delete-button"
                            onClick={() => handleDelete(member.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
