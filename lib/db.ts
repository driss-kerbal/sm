import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'students.db');
export const db = new Database(dbPath);

// Initialize database tables
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      dateOfBirth TEXT,
      address TEXT,
      city TEXT,
      postalCode TEXT,
      country TEXT,
      enrollmentDate TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Initialize on module load
initializeDatabase();
