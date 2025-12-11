import React, { useEffect, useState } from 'react';

const API_BASE = '/api';

export default function AppointmentForm({ clientId, onCreated }) {
  const [staffOptions, setStaffOptions] = useState([]);
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const [loadingStaff, setLoadingStaff] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoadingStaff(true);
        setError('');
        const res = await fetch(`${API_BASE}/staff`);
        if (!res.ok) {
          throw new Error('Failed to load staff list');
        }
        const data = await res.json();
        setStaffOptions(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Could not load staff members');
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!clientId) {
      setError('Missing client id (are you logged in as a client?)');
      return;
    }
    if (!staffId || !date || !time) {
      setError('Please choose a staff member, date, and time.');
      return;
    }

    const [yearStr, monthStr, dayStr] = date.split('-');
    const [hourStr, minuteStr] = time.split(':');

    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // +30 min

    const pad2 = (n) => String(n).padStart(2, '0');

    const startStr = `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(
      minute,
    )}:00`;
    const endStr = `${endDate.getFullYear()}-${pad2(
      endDate.getMonth() + 1,
    )}-${pad2(endDate.getDate())}T${pad2(endDate.getHours())}:${pad2(
      endDate.getMinutes(),
    )}:00`;

    const payload = {
      clientId,
      staffId: Number(staffId),
      start: startStr,
      end: endStr,
      notes: notes.trim() || null,
    };

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let body = {};
        try {
          body = await res.json();
        } catch {
          
        }
        const message =
          body.error ||
          (res.status === 400
            ? 'This time slot is already booked for that staff member.'
            : 'Failed to create appointment.');
        throw new Error(message);
      }

      setSuccess('Appointment created!');
      setNotes('');
     

      if (onCreated) {
        onCreated();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error creating appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card appointment-form" onSubmit={handleSubmit}>
      <h2 className="card-title">New appointment</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-row">
        <label>
          Staff member
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            disabled={loadingStaff}
          >
            <option value="">Select staff...</option>
            {staffOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.role ? `(${s.role})` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row form-row-inline">
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label>
          Time
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Notes (optional)
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything the staff member should know..."
          />
        </label>
      </div>

      <div className="form-row">
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Book appointment'}
        </button>
      </div>
    </form>
  );
}
