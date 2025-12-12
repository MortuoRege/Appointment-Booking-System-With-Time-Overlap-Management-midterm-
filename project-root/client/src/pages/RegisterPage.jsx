// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setSuccess('Registration successful! You can now log in.');
      // small delay then redirect, or navigate immediately:
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      console.error(err);
      setError('Network error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Register as Client</h2>
        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <button type="submit" className="auth-button">
            Register
          </button>
        </form>

        <p className="auth-subtext">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Go to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

