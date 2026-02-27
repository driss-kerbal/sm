import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'students.db');

let dbInstance: Database.Database | null = null;

export function getDb() {
  if (!dbInstance) {
    try {
      dbInstance = new Database(dbPath);
      initializeDatabase();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
  return dbInstance;
}

export const db = getDb();

// Initialize database tables and default user
export function initializeDatabase() {
  try {
    const instance = dbInstance || new Database(dbPath);
    
    instance.exec(`
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

    // Create default admin user if it doesn't exist
    try {
      const existingUser = instance.prepare('SELECT * FROM users WHERE email = ?').get('admin@example.com');
      if (!existingUser) {
        const hashedPassword = require('bcryptjs').hashSync('admin123', 10);
        instance.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
          'Administrator',
          'admin@example.com',
          hashedPassword,
          'admin'
        );
        console.log('✅ Default admin user created');
      }
    } catch (err) {
      console.error('Error creating default user:', err);
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}
