import express from 'express';
import cors from 'cors';
import { dbManager } from '../server/database';
import athletesRouter from '../server/routes/athletes';
import eventsRouter from '../server/routes/events';
import checkinsRouter from '../server/routes/checkins';
import authRouter from '../server/routes/auth';

// Initialize database
dbManager.initialize();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/athletes', athletesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Default handler for Vercel
export default app;
