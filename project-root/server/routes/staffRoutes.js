// server/routes/staffRoutes.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/staff  -> list all staff
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, role, email FROM staff ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
// GET /api/staff/:staffId/appointments?date=YYYY-MM-DD (optional date filter)
router.get('/:staffId/appointments', async (req, res) => {
  const { staffId } = req.params;
  const { date } = req.query;

  try {
    let sql = `
      SELECT
        a.id,
        a.start_time,
        a.end_time,
        a.status,
        a.notes,
        c.name AS client_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      WHERE a.staff_id = ?
    `;
    const params = [staffId];

    if (date) {
      // filter by calendar day if date provided
      sql += ' AND DATE(a.start_time) = ?';
      params.push(date);
    }

    sql += ' ORDER BY a.start_time ASC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error loading staff appointments:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;

