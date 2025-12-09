// server/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'appt_user',
  password: 'password123456',
  database: 'appointment_app'
});

export default pool;

