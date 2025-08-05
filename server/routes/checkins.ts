import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbManager, CheckIn } from '../database';
import { verifyToken } from './auth';

const router = express.Router();

// Get all check-ins with athlete info
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = dbManager.getDatabase();
    const checkins = await db.all(
      `SELECT c.*, a.firstName, a.lastName, a.email, e.name as eventName, e.date as eventDate
       FROM checkins c 
       JOIN athletes a ON c.athleteId = a.id 
       JOIN events e ON c.eventId = e.id
       ORDER BY c.checkInTime DESC
       LIMIT 100`
    );
    res.json({ checkins });
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({ error: 'Failed to get check-ins' });
  }
});

// Get check-ins for a specific event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const db = dbManager.getDatabase();
    
    const checkins = await db.all(
      `SELECT c.*, a.firstName, a.lastName, a.email, a.phone
       FROM checkins c 
       JOIN athletes a ON c.athleteId = a.id 
       WHERE c.eventId = ?
       ORDER BY c.checkInTime DESC`,
      [eventId]
    );
    
    res.json({ checkins });
  } catch (error) {
    console.error('Get event check-ins error:', error);
    res.status(500).json({ error: 'Failed to get event check-ins' });
  }
});

// Get check-ins for today
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('Fetching check-ins for date:', today);
    const db = dbManager.getDatabase();
    
    // Debug: Get all check-ins to see what's in the database
    const allCheckins = await db.all(
      `SELECT c.checkInTime, c.id, a.firstName, a.lastName 
       FROM checkins c 
       JOIN athletes a ON c.athleteId = a.id 
       ORDER BY c.checkInTime DESC LIMIT 10`
    );
    console.log('Recent check-ins in database:', allCheckins.map(c => ({ 
      id: c.id, 
      checkInTime: c.checkInTime, 
      date: c.checkInTime.split('T')[0],
      athlete: `${c.firstName} ${c.lastName}` 
    })));
    
    const checkins = await db.all(
      `SELECT c.*, a.firstName, a.lastName, a.email, e.name as eventName
       FROM checkins c 
       JOIN athletes a ON c.athleteId = a.id 
       JOIN events e ON c.eventId = e.id
       WHERE DATE(c.checkInTime) = ?
       ORDER BY c.checkInTime DESC`,
      [today]
    );
    
    console.log(`Found ${checkins.length} check-ins for today (${today}):`, checkins.map(c => ({ 
      id: c.id, 
      checkInTime: c.checkInTime, 
      date: c.checkInTime.split('T')[0],
      athlete: `${c.firstName} ${c.lastName}` 
    })));
    
    res.json({ checkins });
  } catch (error) {
    console.error('Get today check-ins error:', error);
    res.status(500).json({ error: 'Failed to get today\'s check-ins' });
  }
});

// Create new check-in
router.post('/', async (req, res) => {
  try {
    const { athleteId, eventId, notes } = req.body;

    if (!athleteId || !eventId) {
      return res.status(400).json({ error: 'Athlete ID and Event ID are required' });
    }

    const db = dbManager.getDatabase();
    
    // Verify athlete exists
    const athlete = await db.get('SELECT * FROM athletes WHERE id = ?', [athleteId]);
    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    // Verify event exists and is active
    const event = await db.get('SELECT * FROM events WHERE id = ? AND isActive = 1', [eventId]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found or inactive' });
    }

    // Check if event is in the past
    const today = new Date().toISOString().split('T')[0];
    if (event.date < today) {
      return res.status(400).json({ error: 'Cannot check into past events' });
    }

    // Check if athlete is already checked in for this event
    const existingCheckin = await db.get(
      'SELECT id FROM checkins WHERE athleteId = ? AND eventId = ?',
      [athleteId, eventId]
    );

    if (existingCheckin) {
      return res.status(400).json({ error: 'Athlete already checked in for this event' });
    }

    // Check if event is at capacity
    if (event.currentCapacity >= event.maxCapacity) {
      return res.status(400).json({ error: 'Event is at full capacity' });
    }

    // Validate waiver status
    let waiverValidated = false;
    if (athlete.hasValidWaiver) {
      if (athlete.waiverExpirationDate) {
        const expirationDate = new Date(athlete.waiverExpirationDate);
        const now = new Date();
        waiverValidated = expirationDate > now;
      } else {
        waiverValidated = true; // No expiration date means perpetual waiver
      }
    }

    const checkinId = uuidv4();
    const checkInTime = new Date().toISOString();

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Create check-in record
      await db.run(
        `INSERT INTO checkins (id, athleteId, eventId, checkInTime, waiverValidated, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [checkinId, athleteId, eventId, checkInTime, waiverValidated, notes, checkInTime]
      );

      // Update event capacity
      await db.run(
        'UPDATE events SET currentCapacity = currentCapacity + 1, updatedAt = ? WHERE id = ?',
        [checkInTime, eventId]
      );

      // Update athlete's last visited date
      await db.run(
        'UPDATE athletes SET lastVisited = ?, updatedAt = ? WHERE id = ?',
        [checkInTime.split('T')[0], checkInTime, athleteId]
      );

      await db.run('COMMIT');

      // Get the complete check-in record with athlete and event info
      const newCheckin = await db.get(
        `SELECT c.*, a.firstName, a.lastName, a.email, e.name as eventName
         FROM checkins c 
         JOIN athletes a ON c.athleteId = a.id 
         JOIN events e ON c.eventId = e.id
         WHERE c.id = ?`,
        [checkinId]
      );

      res.status(201).json({ 
        checkin: newCheckin, 
        waiverValidated,
        message: waiverValidated 
          ? 'Check-in successful - waiver validated' 
          : 'Check-in successful - WAIVER VALIDATION REQUIRED'
      });
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create check-in error:', error);
    res.status(500).json({ error: 'Failed to create check-in' });
  }
});

// Update check-in notes
router.patch('/:id/notes', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const db = dbManager.getDatabase();
    
    const existingCheckin = await db.get('SELECT id FROM checkins WHERE id = ?', [id]);
    if (!existingCheckin) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    await db.run('UPDATE checkins SET notes = ? WHERE id = ?', [notes, id]);

    const updatedCheckin = await db.get(
      `SELECT c.*, a.firstName, a.lastName, a.email, e.name as eventName
       FROM checkins c 
       JOIN athletes a ON c.athleteId = a.id 
       JOIN events e ON c.eventId = e.id
       WHERE c.id = ?`,
      [id]
    );

    res.json({ checkin: updatedCheckin, message: 'Notes updated successfully' });
  } catch (error) {
    console.error('Update check-in notes error:', error);
    res.status(500).json({ error: 'Failed to update check-in notes' });
  }
});

// Delete check-in (admin only - for corrections)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = dbManager.getDatabase();
    
    const checkin = await db.get('SELECT * FROM checkins WHERE id = ?', [id]);
    if (!checkin) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Delete check-in record
      await db.run('DELETE FROM checkins WHERE id = ?', [id]);

      // Update event capacity
      await db.run(
        'UPDATE events SET currentCapacity = currentCapacity - 1, updatedAt = ? WHERE id = ?',
        [new Date().toISOString(), checkin.eventId]
      );

      await db.run('COMMIT');
      res.json({ message: 'Check-in deleted successfully' });
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Delete check-in error:', error);
    res.status(500).json({ error: 'Failed to delete check-in' });
  }
});

// Get check-in statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const db = dbManager.getDatabase();
    
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const weekAgo = thisWeek.toISOString().split('T')[0];

    const [todayStats, weekStats, totalStats, waiverStats] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM checkins WHERE DATE(checkInTime) = ?', [today]),
      db.get('SELECT COUNT(*) as count FROM checkins WHERE DATE(checkInTime) >= ?', [weekAgo]),
      db.get('SELECT COUNT(*) as count FROM checkins'),
      db.get('SELECT COUNT(*) as valid, (SELECT COUNT(*) FROM checkins WHERE waiverValidated = 0) as invalid FROM checkins WHERE waiverValidated = 1')
    ]);

    const stats = {
      today: todayStats.count,
      thisWeek: weekStats.count,
      total: totalStats.count,
      waiverValidated: waiverStats.valid,
      waiverNotValidated: waiverStats.invalid
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get check-in stats error:', error);
    res.status(500).json({ error: 'Failed to get check-in statistics' });
  }
});

// Export check-ins data for CRM integration
router.get('/export', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate, eventId } = req.query;
    
    let query = `
      SELECT 
        c.id as checkinId,
        c.checkInTime,
        c.waiverValidated,
        c.notes,
        a.id as athleteId,
        a.firstName,
        a.lastName,
        a.email,
        a.phone,
        a.dateOfBirth,
        a.emergencyContact,
        a.emergencyPhone,
        e.id as eventId,
        e.name as eventName,
        e.date as eventDate,
        e.startTime,
        e.endTime
      FROM checkins c
      JOIN athletes a ON c.athleteId = a.id
      JOIN events e ON c.eventId = e.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (startDate) {
      query += ' AND DATE(c.checkInTime) >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(c.checkInTime) <= ?';
      params.push(endDate);
    }
    
    if (eventId) {
      query += ' AND c.eventId = ?';
      params.push(eventId);
    }
    
    query += ' ORDER BY c.checkInTime DESC';

    const db = dbManager.getDatabase();
    const checkins = await db.all(query, params);

    res.json({ 
      checkins,
      exportedAt: new Date().toISOString(),
      filters: { startDate, endDate, eventId }
    });
  } catch (error) {
    console.error('Export check-ins error:', error);
    res.status(500).json({ error: 'Failed to export check-ins data' });
  }
});

export default router;
