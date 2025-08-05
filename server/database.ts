import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyContactEmail?: string;
  emergencyPhone: string;
  hasValidWaiver: boolean;
  waiverSignedDate?: string;
  waiverExpirationDate?: string;
  lastVisited?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentCapacity: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  athleteId: string;
  eventId: string;
  checkInTime: string;
  waiverValidated: boolean;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'staff';
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

class DatabaseManager {
  private db: Database | null = null;

  async initialize(): Promise<void> {
    // Use data directory for production, or current directory for development
    const dataDir = process.env.NODE_ENV === 'production' 
      ? path.join(process.cwd(), 'data')
      : process.cwd();
    
    // Ensure data directory exists in production
    if (process.env.NODE_ENV === 'production') {
      const fs = await import('fs');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    }

    this.db = await open({
      filename: path.join(dataDir, 'volleyball_checkin.db'),
      driver: sqlite3.Database
    });

    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Athletes table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS athletes (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        dateOfBirth TEXT NOT NULL,
        emergencyContact TEXT NOT NULL,
        emergencyContactEmail TEXT NOT NULL,
        emergencyPhone TEXT NOT NULL,
        hasValidWaiver BOOLEAN DEFAULT FALSE,
        waiverSignedDate TEXT,
        waiverExpirationDate TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Events table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        maxCapacity INTEGER NOT NULL,
        currentCapacity INTEGER DEFAULT 0,
        isActive BOOLEAN DEFAULT TRUE,
        createdBy TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Check-ins table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS checkins (
        id TEXT PRIMARY KEY,
        athleteId TEXT NOT NULL,
        eventId TEXT NOT NULL,
        checkInTime TEXT NOT NULL,
        waiverValidated BOOLEAN NOT NULL,
        notes TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (athleteId) REFERENCES athletes (id),
        FOREIGN KEY (eventId) REFERENCES events (id)
      )
    `);

    // Users table (for staff/admin)
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'staff')) NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Run migrations for new fields
    await this.runMigrations();

    // Create indexes for better performance
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_athletes_email ON athletes(email);
      CREATE INDEX IF NOT EXISTS idx_athletes_name ON athletes(firstName, lastName);
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
      CREATE INDEX IF NOT EXISTS idx_checkins_athlete ON checkins(athleteId);
      CREATE INDEX IF NOT EXISTS idx_checkins_event ON checkins(eventId);
      CREATE INDEX IF NOT EXISTS idx_checkins_time ON checkins(checkInTime);
    `);
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if new columns exist, if not add them
    try {
      // Check if emergencyContactEmail column exists
      await this.db.get(`SELECT emergencyContactEmail FROM athletes LIMIT 1`);
    } catch (error) {
      // Column doesn't exist, add it
      console.log('Adding emergencyContactEmail column to athletes table...');
      await this.db.exec(`ALTER TABLE athletes ADD COLUMN emergencyContactEmail TEXT DEFAULT ''`);
    }

    try {
      // Check if waiverSignedDate column exists
      await this.db.get(`SELECT waiverSignedDate FROM athletes LIMIT 1`);
    } catch (error) {
      // Column doesn't exist, add it
      console.log('Adding waiverSignedDate column to athletes table...');
      await this.db.exec(`ALTER TABLE athletes ADD COLUMN waiverSignedDate TEXT`);
    }

    try {
      // Check if lastVisited column exists
      await this.db.get(`SELECT lastVisited FROM athletes LIMIT 1`);
    } catch (error) {
      // Column doesn't exist, add it
      console.log('Adding lastVisited column to athletes table...');
      await this.db.exec(`ALTER TABLE athletes ADD COLUMN lastVisited TEXT`);
    }
  }

  getDatabase(): Database {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export const dbManager = new DatabaseManager();
