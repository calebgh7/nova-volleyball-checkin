import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { dbManager, User } from '../database';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'volleyball-checkin-secret-key';

// Register new staff/admin user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName } = req.body;

    if (!username || !email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (role !== 'admin' && role !== 'staff') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const db = dbManager.getDatabase();
    
    // Check if user already exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO users (id, username, email, password, role, firstName, lastName, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, username, email, hashedPassword, role, firstName, lastName, now, now]
    );

    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = dbManager.getDatabase();
    const user = await db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    ) as User | undefined;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      token, 
      user: userWithoutPassword,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Verify token middleware
export const verifyToken = (req: any, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify admin role middleware
export const verifyAdmin = (req: any, res: express.Response, next: express.NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get current user info
router.get('/me', verifyToken, async (req: any, res) => {
  try {
    const db = dbManager.getDatabase();
    const user = await db.get(
      'SELECT id, username, email, role, firstName, lastName, createdAt FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Get all users (admin only)
router.get('/users', verifyToken, verifyAdmin, async (req: any, res) => {
  try {
    const db = dbManager.getDatabase();
    const users = await db.all(
      'SELECT id, username, email, role, firstName, lastName, createdAt FROM users ORDER BY createdAt DESC'
    );

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', verifyToken, verifyAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const db = dbManager.getDatabase();
    
    // Check if user exists
    const user = await db.get('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user (admin only)
router.put('/users/:id', verifyToken, verifyAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role, password } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!username || !email || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Username, email, first name, last name, and role are required' });
    }

    if (role !== 'admin' && role !== 'staff') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const db = dbManager.getDatabase();
    
    // Check if user exists
    const existingUser = await db.get('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if username or email already exists for other users
    const duplicateUser = await db.get(
      'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
      [email, username, id]
    );

    if (duplicateUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const now = new Date().toISOString();
    
    // Update user with or without password
    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.run(
        `UPDATE users SET username = ?, email = ?, firstName = ?, lastName = ?, role = ?, password = ?, updatedAt = ?
         WHERE id = ?`,
        [username, email, firstName, lastName, role, hashedPassword, now, id]
      );
    } else {
      await db.run(
        `UPDATE users SET username = ?, email = ?, firstName = ?, lastName = ?, role = ?, updatedAt = ?
         WHERE id = ?`,
        [username, email, firstName, lastName, role, now, id]
      );
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
