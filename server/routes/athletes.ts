import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbManager, Athlete } from '../database';
import { verifyToken } from './auth';

const router = express.Router();

// Get all athletes
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = dbManager.getDatabase();
    const athletes = await db.all('SELECT * FROM athletes ORDER BY firstName, lastName');
    res.json({ athletes });
  } catch (error) {
    console.error('Get athletes error:', error);
    res.status(500).json({ error: 'Failed to get athletes' });
  }
});

// Search athletes by name or email
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const db = dbManager.getDatabase();
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const athletes = await db.all(
      `SELECT * FROM athletes 
       WHERE LOWER(firstName) LIKE ? 
          OR LOWER(lastName) LIKE ? 
          OR LOWER(email) LIKE ?
       ORDER BY firstName, lastName
       LIMIT 20`,
      [searchTerm, searchTerm, searchTerm]
    );

    res.json({ athletes });
  } catch (error) {
    console.error('Search athletes error:', error);
    res.status(500).json({ error: 'Failed to search athletes' });
  }
});

// Get athlete by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = dbManager.getDatabase();
    
    const athlete = await db.get('SELECT * FROM athletes WHERE id = ?', [id]);
    
    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    res.json({ athlete });
  } catch (error) {
    console.error('Get athlete error:', error);
    res.status(500).json({ error: 'Failed to get athlete' });
  }
});

// Create new athlete
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      emergencyContact,
      emergencyContactEmail,
      emergencyPhone,
      hasValidWaiver = false,
      waiverSignedDate,
      waiverExpirationDate
    } = req.body;

    // Validation - only firstName, lastName, dateOfBirth, and emergencyContact are required
    if (!firstName || !lastName || !dateOfBirth || !emergencyContact || !emergencyPhone) {
      return res.status(400).json({ error: 'First name, last name, date of birth, emergency contact name, and emergency phone are required' });
    }

    const db = dbManager.getDatabase();
    
    // Check if athlete already exists (only if email is provided)
    if (email) {
      const existingAthlete = await db.get('SELECT id FROM athletes WHERE email = ?', [email]);
      if (existingAthlete) {
        return res.status(400).json({ error: 'Athlete with this email already exists' });
      }
    }

    const athleteId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO athletes (
        id, firstName, lastName, email, phone, dateOfBirth, 
        emergencyContact, emergencyContactEmail, emergencyPhone, hasValidWaiver, 
        waiverSignedDate, waiverExpirationDate, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        athleteId, firstName, lastName, email, phone, dateOfBirth,
        emergencyContact, emergencyContactEmail, emergencyPhone, hasValidWaiver, 
        waiverSignedDate, waiverExpirationDate, now, now
      ]
    );

    const newAthlete = await db.get('SELECT * FROM athletes WHERE id = ?', [athleteId]);
    res.status(201).json({ athlete: newAthlete, message: 'Athlete created successfully' });
  } catch (error) {
    console.error('Create athlete error:', error);
    res.status(500).json({ error: 'Failed to create athlete' });
  }
});

// Update athlete
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      emergencyContact,
      emergencyContactEmail,
      emergencyPhone,
      hasValidWaiver,
      waiverSignedDate,
      waiverExpirationDate
    } = req.body;

    const db = dbManager.getDatabase();
    
    // Check if athlete exists
    const existingAthlete = await db.get('SELECT id FROM athletes WHERE id = ?', [id]);
    if (!existingAthlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    // Check if email is taken by another athlete
    if (email) {
      const emailTaken = await db.get('SELECT id FROM athletes WHERE email = ? AND id != ?', [email, id]);
      if (emailTaken) {
        return res.status(400).json({ error: 'Email already in use by another athlete' });
      }
    }

    const now = new Date().toISOString();
    
    await db.run(
      `UPDATE athletes SET 
        firstName = COALESCE(?, firstName),
        lastName = COALESCE(?, lastName),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        dateOfBirth = COALESCE(?, dateOfBirth),
        emergencyContact = COALESCE(?, emergencyContact),
        emergencyContactEmail = COALESCE(?, emergencyContactEmail),
        emergencyPhone = COALESCE(?, emergencyPhone),
        hasValidWaiver = COALESCE(?, hasValidWaiver),
        waiverSignedDate = COALESCE(?, waiverSignedDate),
        waiverExpirationDate = COALESCE(?, waiverExpirationDate),
        updatedAt = ?
       WHERE id = ?`,
      [
        firstName, lastName, email, phone, dateOfBirth,
        emergencyContact, emergencyContactEmail, emergencyPhone, hasValidWaiver, 
        waiverSignedDate, waiverExpirationDate, now, id
      ]
    );

    const updatedAthlete = await db.get('SELECT * FROM athletes WHERE id = ?', [id]);
    res.json({ athlete: updatedAthlete, message: 'Athlete updated successfully' });
  } catch (error) {
    console.error('Update athlete error:', error);
    res.status(500).json({ error: 'Failed to update athlete' });
  }
});

// Update waiver status
router.patch('/:id/waiver', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { hasValidWaiver, waiverSignedDate, waiverExpirationDate } = req.body;

    const db = dbManager.getDatabase();
    
    const existingAthlete = await db.get('SELECT id FROM athletes WHERE id = ?', [id]);
    if (!existingAthlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    const now = new Date().toISOString();
    
    await db.run(
      `UPDATE athletes SET 
        hasValidWaiver = ?,
        waiverSignedDate = ?,
        waiverExpirationDate = ?,
        updatedAt = ?
       WHERE id = ?`,
      [hasValidWaiver, waiverSignedDate, waiverExpirationDate, now, id]
    );

    const updatedAthlete = await db.get('SELECT * FROM athletes WHERE id = ?', [id]);
    res.json({ athlete: updatedAthlete, message: 'Waiver status updated successfully' });
  } catch (error) {
    console.error('Update waiver error:', error);
    res.status(500).json({ error: 'Failed to update waiver status' });
  }
});

// Delete athlete
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = dbManager.getDatabase();
    
    const existingAthlete = await db.get('SELECT id FROM athletes WHERE id = ?', [id]);
    if (!existingAthlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    await db.run('DELETE FROM athletes WHERE id = ?', [id]);
    res.json({ message: 'Athlete deleted successfully' });
  } catch (error) {
    console.error('Delete athlete error:', error);
    res.status(500).json({ error: 'Failed to delete athlete' });
  }
});

export default router;
