import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbManager } from '../server/database';
import athleteRoutes from '../server/routes/athletes';
import eventRoutes from '../server/routes/events';
import checkinRoutes from '../server/routes/checkins';
import authRoutes from '../server/routes/auth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Routes
app.use('/api/athletes', athleteRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
