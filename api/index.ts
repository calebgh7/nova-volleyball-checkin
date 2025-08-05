import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { dbManager } from '../server/database';
import athleteRoutes from '../server/routes/athletes';
import eventRoutes from '../server/routes/events';
import checkinRoutes from '../server/routes/checkins';
import authRoutes from '../server/routes/auth';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Initialize database
dbManager.initialize().catch(console.error);

// Routes - no need for /api prefix since Vercel routes already handle that
app.use('/athletes', athleteRoutes);
app.use('/events', eventRoutes);
app.use('/checkins', checkinRoutes);
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
