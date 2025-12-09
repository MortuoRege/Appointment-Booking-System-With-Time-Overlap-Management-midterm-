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

export default router;

