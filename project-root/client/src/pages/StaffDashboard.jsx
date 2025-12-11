import React, { useEffect, useState } from 'react';
import AppointmentList from '../components/AppointmentList';

const API_BASE = '/api';

export default function StaffDashboard() {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAppointments = async (dateToLoad = selectedDate) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        staffId: String(user.id),
        date: dateToLoad,
      });
      const res = await fetch(
        `${API_BASE}/appointments?${params.toString()}`,
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
    loadAppointments(selectedDate);
   
  }, [user?.id, selectedDate]);

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
      await loadAppointments(selectedDate);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error cancelling appointment');
    }
  };

  if (!user || user.role !== 'staff') {
    return (
      <div className="page">
        <div className="card">
          <h1>Staff dashboard</h1>
          <p>You must be logged in as a staff member to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Staff dashboard</h1>
        <p className="muted">
          Review your schedule and manage your appointments.
        </p>
      </div>

      <div className="card">
        <div className="toolbar">
          <label>
            Date
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </label>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <AppointmentList
            appointments={appointments}
            onCancel={handleCancel}
            showClient
          />
        )}
      </div>
    </div>
  );
}
