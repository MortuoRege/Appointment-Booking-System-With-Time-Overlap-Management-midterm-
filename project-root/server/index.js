// server/index.js
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import clientRoutes from './routes/clientRoutes.js'; 
import appointmentRoutes from './routes/appointmentRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = 4000; 
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

