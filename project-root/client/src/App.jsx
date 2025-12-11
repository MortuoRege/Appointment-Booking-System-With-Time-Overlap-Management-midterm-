import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientDashboard from './pages/ClientDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  // Load user from localStorage or null
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // Called after login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <header>
        <h1>Appointment Booking</h1>
        {user && <button onClick={handleLogout}>Logout</button>}
      </header>

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/client"
          element={user?.role === 'client' ? <ClientDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/staff"
          element={user?.role === 'staff' ? <StaffDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
        />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to={user ? `/${user.role}` : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
git 