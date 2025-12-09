// server/routes/appointmentRoutes.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/appointments
// Optional query params: clientId, staffId, date (YYYY-MM-DD)
router.get('/', async (req, res) => {
  const { clientId, staffId, date } = req.query;

  try {
    let sql = `
      SELECT
        a.id,
        a.client_id,
        a.staff_id,
        a.start_time,
        a.end_time,
        a.status,
        a.notes,
        c.name AS client_name,
        s.name AS staff_name,
        s.role AS staff_role
      FROM appointments a
      JOIN clients c ON c.id = a.client_id
      JOIN staff   s ON s.id = a.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (clientId) {
      sql += ' AND a.client_id = ?';
      params.push(clientId);
    }

     if (staffId) {
      sql += ' AND a.staff_id = ?';
      params.push(staffId);
    }

    if (date) {
      sql += ' AND DATE(a.start_time) = ?';
      params.push(date);
    }

    sql += ' ORDER BY a.start_time';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/appointments
// Body: { clientId, staffId, start, end, notes }
router.post('/', async (req, res) => {
  const { clientId, staffId, start, end, notes } = req.body;

  if (!clientId || !staffId || !start || !end) {
    return res.status(400).json({ error: 'clientId, staffId, start and end are required' });
  }

  try {
    // 1) overlap check
    const [conflicts] = await pool.query(
      `SELECT 1
       FROM appointments
       WHERE staff_id = ?
         AND status != 'cancelled'
         AND start_time < ?
         AND end_time > ?
       LIMIT 1`,
      [staffId, end, start]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ error: 'Time conflict with another appointment' });
    }

    // 2) insert
    const [result] = await pool.query(
      `INSERT INTO appointments (client_id, staff_id, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [clientId, staffId, start, end, notes || null]
    );

    // 3) return the created appointment with joined names
    const [rows] = await pool.query(
      `SELECT
         a.id,
         a.client_id,
         a.staff_id,
         a.start_time,
         a.end_time,
         a.status,
         a.notes,
         c.name AS client_name,
         s.name AS staff_name,
         s.role AS staff_role
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       JOIN staff   s ON s.id = a.staff_id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PATCH /api/appointments/:id
// Body: { status } (for now we only update status, e.g. cancel)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;

