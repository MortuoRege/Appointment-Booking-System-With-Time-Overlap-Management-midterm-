import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Call backend to register client
            await api.post('/auth/register-client', { name, email, password });

            // Redirect to login page after successful registration
            navigate('/login');
        } catch (err) {
            // Show error message returned from backend
            setError(err.message);
        }
    };

    return (
        <div className="register-page" style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" style={{ padding: '10px', marginTop: '10px' }}>Register</button>
            </form>
        </div>
    );
}
