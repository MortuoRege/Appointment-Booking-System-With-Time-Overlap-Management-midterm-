// server/routes/adminRoutes.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/admin/staff
router.get('/staff', async (req, res) => {
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

// POST /api/admin/staff
router.post('/staff', async (req, res) => {
  const { name, role, email, password } = req.body;

  if (!name || !role || !email || !password) {
    return res.status(400).json({ error: 'Name, role, email and password are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO staff (name, role, email, password_hash) VALUES (?, ?, ?, ?)',
      [name, role, email, password] // plain text for now
    );

    const [rows] = await pool.query(
      'SELECT id, name, role, email FROM staff WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


// DELETE /api/admin/staff/:id
router.delete('/staff/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM staff WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;

