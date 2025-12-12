// src/App.jsx
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ClientDashboard from "./pages/ClientDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.error("Invalid user data in localStorage, clearing it", err);
      localStorage.removeItem("user");
      return null;
    }
  });

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <Router>
      <div className="app-root">
        {user && (
          <header className="app-header">
            <h1 className="app-title">Appointment Booking System</h1>
            <div className="app-header-spacer" />
            <span className="app-user">
              {user.name} ({user.role})
            </span>
            <button className="app-logout" onClick={handleLogout}>
              Logout
            </button>
          </header>
        )}

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/client"
            element={
              user && user.role === "client" ? (
                <ClientDashboard user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/staff"
            element={
              user && user.role === "staff" ? (
                <StaffDashboard user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user && user.role === "admin" ? (
                <AdminDashboard user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
