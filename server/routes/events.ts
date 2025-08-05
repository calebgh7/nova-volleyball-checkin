import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbManager, Event } from '../database';
import { verifyToken, verifyAdmin } from './auth';
import type { AuthenticatedRequest } from '../types';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const db = dbManager.getDatabase();
    const events = await db.all(
      'SELECT * FROM events ORDER BY date DESC, startTime ASC'
    );
    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Get today's events
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const db = dbManager.getDatabase();
    
    const events = await db.all(
      'SELECT * FROM events WHERE date = ? AND isActive = 1 ORDER BY startTime ASC',
      [today]
    );
    
    res.json({ events });
  } catch (error) {
    console.error('Get today events error:', error);
    res.status(500).json({ error: 'Failed to get today\'s events' });
  }
});

// Get disabled events
router.get('/disabled', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const db = dbManager.getDatabase();
    
    const events = await db.all(
      'SELECT * FROM events WHERE date >= ? AND isActive = 0 ORDER BY date ASC, startTime ASC',
      [today]
    );
    
    res.json({ events });
  } catch (error) {
    console.error('Get disabled events error:', error);
    res.status(500).json({ error: 'Failed to get disabled events' });
  }
});

// Get past events
router.get('/past', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const db = dbManager.getDatabase();
    
    const events = await db.all(
      'SELECT * FROM events WHERE date < ? ORDER BY date DESC, startTime DESC LIMIT 20',
      [today]
    );
    
    res.json({ events });
  } catch (error) {
    console.error('Get past events error:', error);
    res.status(500).json({ error: 'Failed to get past events' });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = dbManager.getDatabase();
    
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get check-ins for this event
    const checkins = await db.all(
      `SELECT c.*, a.firstName, a.lastName, a.email 
       FROM checkins c 
       JOIN athletes a ON c.athleteId = a.id 
       WHERE c.eventId = ? 
       ORDER BY c.checkInTime DESC`,
      [id]
    );

    res.json({ event: { ...event, checkins } });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// Create new event (staff/admin only)
router.post('/', verifyToken, async (req: any, res) => {
  try {
    const {
      name,
      description,
      date,
      startTime,
      endTime,
      maxCapacity
    } = req.body;

    // Validation
    if (!name || !date || !startTime || !endTime || !maxCapacity) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (maxCapacity <= 0) {
      return res.status(400).json({ error: 'Max capacity must be greater than 0' });
    }

    const db = dbManager.getDatabase();
    const eventId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO events (
        id, name, description, date, startTime, endTime, maxCapacity, 
        currentCapacity, isActive, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId, name, description, date, startTime, endTime, maxCapacity,
        0, true, req.user.userId, now, now
      ]
    );

    const newEvent = await db.get('SELECT * FROM events WHERE id = ?', [eventId]);
    res.status(201).json({ event: newEvent, message: 'Event created successfully' });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event (staff/admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      date,
      startTime,
      endTime,
      maxCapacity,
      isActive
    } = req.body;

    const db = dbManager.getDatabase();
    
    // Check if event exists
    const existingEvent = await db.get('SELECT id FROM events WHERE id = ?', [id]);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const now = new Date().toISOString();
    
    await db.run(
      `UPDATE events SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        startTime = COALESCE(?, startTime),
        endTime = COALESCE(?, endTime),
        maxCapacity = COALESCE(?, maxCapacity),
        isActive = COALESCE(?, isActive),
        updatedAt = ?
       WHERE id = ?`,
      [name, description, date, startTime, endTime, maxCapacity, isActive, now, id]
    );

    const updatedEvent = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    res.json({ event: updatedEvent, message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Toggle event active status (staff/admin only)
router.patch('/:id/toggle', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = dbManager.getDatabase();
    
    const existingEvent = await db.get('SELECT isActive FROM events WHERE id = ?', [id]);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const newStatus = !existingEvent.isActive;
    const now = new Date().toISOString();
    
    await db.run(
      'UPDATE events SET isActive = ?, updatedAt = ? WHERE id = ?',
      [newStatus, now, id]
    );

    const updatedEvent = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    res.json({ 
      event: updatedEvent, 
      message: `Event ${newStatus ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('Toggle event error:', error);
    res.status(500).json({ error: 'Failed to toggle event status' });
  }
});

// Delete event (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = dbManager.getDatabase();
    
    const existingEvent = await db.get('SELECT id FROM events WHERE id = ?', [id]);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if there are any check-ins for this event
    const checkins = await db.get('SELECT COUNT(*) as count FROM checkins WHERE eventId = ?', [id]);
    if (checkins.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete event with existing check-ins. Deactivate it instead.' 
      });
    }

    await db.run('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get event statistics
router.get('/:id/stats', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = dbManager.getDatabase();
    
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const totalCheckins = await db.get(
      'SELECT COUNT(*) as count FROM checkins WHERE eventId = ?',
      [id]
    );

    const waiverValidated = await db.get(
      'SELECT COUNT(*) as count FROM checkins WHERE eventId = ? AND waiverValidated = 1',
      [id]
    );

    const waiverNotValidated = await db.get(
      'SELECT COUNT(*) as count FROM checkins WHERE eventId = ? AND waiverValidated = 0',
      [id]
    );

    const stats = {
      totalCheckins: totalCheckins.count,
      waiverValidated: waiverValidated.count,
      waiverNotValidated: waiverNotValidated.count,
      capacityUsed: (totalCheckins.count / event.maxCapacity * 100).toFixed(1)
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({ error: 'Failed to get event statistics' });
  }
});

export default router;
