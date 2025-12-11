import React, { useEffect, useState } from 'react';

const API_BASE = '/api';

export default function AdminDashboard() {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/admin/staff`);
      if (!res.ok) {
        throw new Error('Failed to load staff list');
      }
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!name || !role || !email || !password) {
      setCreateError('Please fill in all fields.');
      return;
    }

    const payload = { name, role, email, password };

    try {
      setCreating(true);
      const res = await fetch(`${API_BASE}/admin/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let body = {};
        try {
          body = await res.json();
        } catch {
          
        }
        const msg = body.error || 'Failed to create staff member';
        throw new Error(msg);
      }

      setCreateSuccess('Staff member created.');
      setName('');
      setRole('');
      setEmail('');
      setPassword('');
      await loadStaff();
    } catch (err) {
      console.error(err);
      setCreateError(err.message || 'Error creating staff member');
    } finally {
      setCreating(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="page">
        <div className="card">
          <h1>Admin dashboard</h1>
          <p>You must be logged in as an admin to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admin dashboard</h1>
        <p className="muted">
          Manage staff accounts. (Optional: add an appointments tab later.)
        </p>
      </div>

      <div className="page-grid page-grid-admin">
        <form className="card" onSubmit={handleCreateStaff}>
          <h2 className="card-title">Add staff member</h2>

          {createError && <div className="alert alert-error">{createError}</div>}
          {createSuccess && (
            <div className="alert alert-success">{createSuccess}</div>
          )}

          <div className="form-row">
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Role
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Tutor / Support / Dentist..."
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@example.com"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <button className="btn" type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create staff'}
            </button>
          </div>
        </form>

        <div className="card">
          <h2 className="card-title">Staff members</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {loading ? (
            <p>Loading...</p>
          ) : staff.length === 0 ? (
            <p className="muted">No staff yet.</p>
          ) : (
            <table className="card-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.role}</td>
                    <td>{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
