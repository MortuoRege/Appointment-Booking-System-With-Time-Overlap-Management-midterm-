// src/pages/ClientDashboard.jsx
import { useEffect, useState } from 'react';

function ClientDashboard({ user }) {
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [form, setForm] = useState({
    staffId: '',
    date: '',
    time: '',
    notes: '',
  });

  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ---------- data loading ----------

  useEffect(() => {
    loadStaff();
    loadAppointments();
  }, []);

  async function loadStaff() {
    try {
      setLoadingStaff(true);
      setError('');
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load staff');
      setStaff(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingStaff(false);
    }
  }

  async function loadAppointments() {
    try {
      setLoadingAppointments(true);
      setError('');
      const res = await fetch(`/api/clients/${user.id}/appointments`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load appointments');
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingAppointments(false);
    }
  }

  // ---------- helpers ----------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function isValidTimeString(str) {
    // Accepts "HH:MM" 24-hour
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(str);
    return !!match;
  }

  function formatMySQLDate(dateObj) {
    // "YYYY-MM-DD HH:MM:SS"
    const iso = dateObj.toISOString().slice(0, 19);
    return iso.replace('T', ' ');
  }

  function formatDateTime(dtString) {
    const dt = new Date(dtString);
    return dt.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  // ---------- actions ----------

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.staffId || !form.date || !form.time) {
      setError('Please choose staff, date and time.');
      return;
    }

    if (!isValidTimeString(form.time)) {
      setError('Time must be in 24h format like 09:30 or 15:00.');
      return;
    }

    try {
      setBooking(true);

      // Build start/end (60 minutes)
      const start = new Date(`${form.date}T${form.time}:00`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user.id,
          staffId: Number(form.staffId),
          start: formatMySQLDate(start),
          end: formatMySQLDate(end),
          notes: form.notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book appointment');

      setSuccess('Appointment booked successfully.');
      setForm({ staffId: '', date: '', time: '', notes: '' });
      await loadAppointments();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setBooking(false);
    }
  }

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
          a.id === id ? { ...a, status: 'cancelled' } : a
        )
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // ---------- UI ----------

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner admin-inner">
        <div className="dashboard-header-row">
          <div>
            <h2 className="dashboard-title">Client dashboard</h2>
            <p className="dashboard-subtitle">
              Book new appointments and manage your upcoming schedule.
            </p>
          </div>
        </div>

        <div className="admin-grid">
          {/* New appointment */}
          <section className="admin-card">
            <h3 className="admin-card-title">New appointment</h3>
            <p className="admin-card-subtitle">
              Choose a staff member, date and time. Appointments are 60 minutes by default.
            </p>

            {error && <p className="auth-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}

            <form className="client-form" onSubmit={handleSubmit}>
              <div className="client-form-grid">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="staffId">
                    Staff member
                  </label>
                  <select
                    id="staffId"
                    name="staffId"
                    className="auth-select"
                    value={form.staffId}
                    onChange={handleChange}
                    disabled={loadingStaff || staff.length === 0}
                  >
                    <option value="">
                      {loadingStaff
                        ? 'Loading staff…'
                        : staff.length === 0
                        ? 'No staff available'
                        : 'Select staff…'}
                    </option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="date">
                    Date
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    className="auth-input"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="time">
                    Time
                  </label>
                  <input
                    id="time"
                    name="time"
                    type="text"
                    placeholder="HH:MM (24h, e.g. 15:00)"
                    className="auth-input"
                    value={form.time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="auth-field" style={{ marginTop: '0.4rem' }}>
                <label className="auth-label" htmlFor="notes">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="auth-input"
                  style={{ minHeight: '70px', resize: 'vertical' }}
                  placeholder="Anything the staff member should know..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="auth-button client-submit"
                disabled={booking || staff.length === 0}
              >
                {booking ? 'Booking…' : 'Book appointment'}
              </button>
            </form>
          </section>

          {/* Appointments list */}
          <section className="admin-card">
            <h3 className="admin-card-title">Your appointments</h3>
            <p className="admin-card-subtitle">
              {loadingAppointments
                ? 'Loading appointments…'
                : appointments.length === 0
                ? 'No appointments to show.'
                : 'Upcoming and past appointments.'}
            </p>

            {appointments.length > 0 && (
              <div className="appointment-list">
                {appointments.map((appt) => (
                  <article key={appt.id} className="appointment-card">
                    <div className="appointment-header-row">
                      <div>
                        <div className="appointment-staff">
                          With <span>{appt.staff_name}</span> ({appt.staff_role})
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
    </div>
  );
}

export default ClientDashboard;

