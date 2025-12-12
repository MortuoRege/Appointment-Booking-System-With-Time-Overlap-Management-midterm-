// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'client',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      onLogin(data);

      if (data.role === 'client') navigate('/client');
      else if (data.role === 'staff') navigate('/staff');
      else navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Network error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <div className="auth-field">
            <label className="auth-label" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="auth-select"
              value={form.role}
              onChange={handleChange}
            >
              <option value="client">Client</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        {/* NEW: register link */}
        <p className="auth-subtext">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-link">
            Register as client
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

