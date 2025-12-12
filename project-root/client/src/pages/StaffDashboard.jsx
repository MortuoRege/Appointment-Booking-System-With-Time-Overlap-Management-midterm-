// src/pages/StaffDashboard.jsx
import { useEffect, useState } from 'react';

function StaffDashboard({ user }) {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // "YYYY-MM-DD"
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // -------- helpers --------

  function formatDateTime(dtString) {
    const dt = new Date(dtString);
    return dt.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  // -------- data loading --------

  useEffect(() => {
    if (!user) return;
    loadAppointments(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, date]);

  async function loadAppointments(selectedDate) {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await fetch(
        `/api/staff/${user.id}/appointments?date=${selectedDate}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load appointments');

      setAppointments(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  function handleDateChange(e) {
    setDate(e.target.value);
  }

  // staff can cancel (or reschedule later if you extend API)
  async function handleCancel(id) {
    const ok = window.confirm('Cancel this appointment?');
    if (!ok) return;

    try {
      setError('');
      setSuccess('');

      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel appointment');

      setSuccess('Appointment cancelled.');
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'cancelled' } : a,
        ),
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // -------- UI --------

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner admin-inner">
        <div className="dashboard-header-row">
          <div>
            <h2 className="dashboard-title">Staff dashboard</h2>
            <p className="dashboard-subtitle">
              Review your schedule and manage your appointments.
            </p>
          </div>
        </div>

        <section className="admin-card">
          <div className="staff-filter-row">
            <div className="auth-field">
              <label className="auth-label" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="auth-input"
                value={date}
                onChange={handleDateChange}
              />
            </div>
            <div className="staff-summary">
              {loading
                ? 'Loading appointments…'
                : appointments.length === 0
                ? 'No appointments to show for this day.'
                : `${appointments.length} appointment${
                    appointments.length === 1 ? '' : 's'
                  } on this day.`}
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          {appointments.length > 0 && (
            <div className="appointment-list">
              {appointments.map((appt) => (
                <article key={appt.id} className="appointment-card">
                  <div className="appointment-header-row">
                    <div>
                      <div className="appointment-staff">
                        With <span>{appt.client_name}</span>
                      </div>
                      <div className="appointment-time">
                        {formatDateTime(appt.start_time)} –{' '}
                        {formatDateTime(appt.end_time)}
                      </div>
                    </div>
                    <div className="appointment-status-wrapper">
                      <span
                        className={
                          appt.status === 'cancelled'
                            ? 'appt-status appt-status-cancelled'
                            : 'appt-status appt-status-confirmed'
                        }
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>

                  {appt.notes && (
                    <div className="appointment-notes">
                      Notes: <span>{appt.notes}</span>
                    </div>
                  )}

                  {appt.status !== 'cancelled' && (
                    <div className="appointment-actions">
                      <button
                        type="button"
                        className="admin-delete-button"
                        onClick={() => handleCancel(appt.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default StaffDashboard;

