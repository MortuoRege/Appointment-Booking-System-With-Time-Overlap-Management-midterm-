// server/routes/clientRoutes.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

/**
 * GET /api/clients
 * Return a list of all clients (id, name, email).
 * This is mainly useful for admin/debug, not for normal users.
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email FROM clients ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /api/clients/:id/appointments
 * Return all appointments for a given client id,
 * including staff name + role.
 */
router.get('/:id/appointments', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `
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
      WHERE a.client_id = ?
      ORDER BY a.start_time
      `,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching client appointments:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;

