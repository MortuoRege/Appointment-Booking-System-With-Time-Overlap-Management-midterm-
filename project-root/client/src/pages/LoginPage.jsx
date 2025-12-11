import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function LoginPage({ onLogin }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('client'); // default role
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Call backend login API
            const user = await api.post('/auth/login', { email, password, role });

            // Store user in localStorage
            localStorage.setItem('user', JSON.stringify(user));

            // Update App state via onLogin
            onLogin(user);

            // Redirect to dashboard based on role
            if (user.role === 'client') navigate('/client');
            else if (user.role === 'staff') navigate('/staff');
            else if (user.role === 'admin') navigate('/admin');
            else navigate('/login'); // fallback
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-page">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Role:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="client">Client</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit">Login</button>
            </form>
        </div>
    );
}
