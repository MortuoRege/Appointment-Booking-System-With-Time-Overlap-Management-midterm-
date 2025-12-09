// server/routes/authRoutes.js
import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// POST /api/auth/register-client
router.post('/register-client', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO clients (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, password] // NOTE: plain text for now
    );

    const [rows] = await pool.query(
      'SELECT id, name, email FROM clients WHERE id = ?',
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

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password and role are required' });
  }

  if (!['client', 'staff', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    let table;
    if (role === 'client') table = 'clients';
    if (role === 'staff') table = 'staff';
    if (role === 'admin') table = 'admins';

    const [rows] = await pool.query(
      `SELECT id, name, email, password_hash FROM ${table} WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // NOTE: for now, we're storing plain passwords in password_hash.
    // In a real app, you would use bcrypt.compare() here.
    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Don’t send password_hash back
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
}); 

export default router;
