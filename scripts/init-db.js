#!/usr/bin/env node

/**
 * Build script for Vercel deployment
 * Initializes the SQLite database during build time
 */

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔧 Initializing database for production...');

try {
  const dbPath = path.join(process.cwd(), 'students.db');
  const db = new Database(dbPath);

  // Create tables if they don't exist
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

  console.log('✅ Database initialized successfully');
  db.close();
} catch (error) {
  console.error('❌ Failed to initialize database:', error.message);
  process.exit(1);
}
