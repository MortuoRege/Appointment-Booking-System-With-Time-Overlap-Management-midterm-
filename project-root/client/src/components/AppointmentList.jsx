import React from 'react';

export default function AppointmentList({
  appointments,
  onCancel,
  showStaff = false,
  showClient = false,
}) {
  if (!appointments || appointments.length === 0) {
    return <p className="muted">No appointments to show.</p>;
  }

  const formatDateTime = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      
      return value;
    }
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <table className="card-table">
      <thead>
        <tr>
          <th>Date & time</th>
          {showClient && <th>Client</th>}
          {showStaff && <th>Staff member</th>}
          <th>Status</th>
          <th>Notes</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {appointments.map((appt) => {
          const id = appt.id;
          const start = appt.start_time || appt.start;
          const end = appt.end_time || appt.end;
          const clientName = appt.client_name || appt.clientName;
          const staffName = appt.staff_name || appt.staffName;
          const status = appt.status || 'confirmed';
          const isCancelled = status === 'cancelled';

          return (
            <tr key={id} className={isCancelled ? 'row-cancelled' : ''}>
              <td>
                <div className="datetime">
                  <span>{formatDateTime(start)}</span>
                  <span className="datetime-end">→ {formatDateTime(end)}</span>
                </div>
              </td>
              {showClient && <td>{clientName || '-'}</td>}
              {showStaff && <td>{staffName || '-'}</td>}
              <td className={`status-chip status-${status}`}>{status}</td>
              <td>{appt.notes || '-'}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => onCancel(id)}
                  disabled={isCancelled}
                >
                  {isCancelled ? 'Cancelled' : 'Cancel'}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
