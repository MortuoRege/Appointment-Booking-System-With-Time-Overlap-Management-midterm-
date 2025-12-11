import React, { useEffect, useState } from 'react';
import AppointmentForm from '../components/AppointmentForm';
import AppointmentList from '../components/AppointmentList';

const API_BASE = '/api';

export default function ClientDashboard() {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAppointments = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(
        `${API_BASE}/appointments?clientId=${encodeURIComponent(user.id)}`,
      );
      if (!res.ok) {
        throw new Error('Failed to load appointments');
      }
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    
  }, [user?.id]);

  const handleCancel = async (appointmentId) => {
    try {
      const res = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) {
        throw new Error('Failed to cancel appointment');
      }
      await loadAppointments();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error cancelling appointment');
    }
  };

  if (!user || user.role !== 'client') {
    return (
      <div className="page">
        <div className="card">
          <h1>Client dashboard</h1>
          <p>You must be logged in as a client to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Client dashboard</h1>
        <p className="muted">
          Book new appointments and manage your upcoming schedule.
        </p>
      </div>

      <div className="page-grid">
        <AppointmentForm clientId={user.id} onCreated={loadAppointments} />

        <div className="card">
          <h2 className="card-title">Your appointments</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AppointmentList
              appointments={appointments}
              onCancel={handleCancel}
              showStaff
            />
          )}
        </div>
      </div>
    </div>
  );
}
