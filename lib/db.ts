import { Pool, QueryResult } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

// Determine if we're using PostgreSQL or SQLite
const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost');
const usePostgres = isProduction || hasDatabaseUrl;

// ============= PostgreSQL Setup =============
let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;

  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required for PostgreSQL');
  }

  pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
  });

  return pool;
}

// ============= SQLite Setup (Local Development) =============
const dbPath = path.join(process.cwd(), 'students.db');
let sqliteDb: Database.Database | null = null;

export function getSqliteDb(): Database.Database {
  if (!sqliteDb) {
    sqliteDb = new Database(dbPath);
  }
  return sqliteDb;
}

// ============= Unified Query Interface =============
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  if (usePostgres) {
    // PostgreSQL query
    const pool_ = getPool();
    try {
      const result = await pool_.query(text, params);
      return result;
    } catch (error) {
      console.error('Database Query Error:', error);
      throw error;
    }
  } else {
    // SQLite query
    try {
      const db = getSqliteDb();
      
      // Convert PostgreSQL syntax to SQLite
      let sqliteQuery = text;
      
      // Replace $1, $2, etc with ?
      sqliteQuery = sqliteQuery.replace(/\$\d+/g, '?');
      
      // Replace SERIAL with INTEGER for SQLite
      sqliteQuery = sqliteQuery.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
      
      // Replace TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      sqliteQuery = sqliteQuery.replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'TEXT DEFAULT CURRENT_TIMESTAMP');
      
      const stmt = db.prepare(sqliteQuery);
      const result = stmt.all(...(params || []));
      
      return {
        rows: Array.isArray(result) ? result : [result],
        rowCount: Array.isArray(result) ? result.length : 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      };
    } catch (error) {
      console.error('SQLite Query Error:', error);
      throw error;
    }
  }
}

// Initialize database tables and default user
export async function initializeDatabase() {
  try {
    if (usePostgres) {
      console.log('🔄 Initializing PostgreSQL database...');
      
      // Create tables
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS students (
          id SERIAL PRIMARY KEY,
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
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      console.log('🔄 Initializing SQLite database (local development)...');
      const db = getSqliteDb();
      
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
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

    // Create default admin user if it doesn't exist
    try {
      const result = await query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
      
      if (result.rows.length === 0) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        
        if (usePostgres) {
          await query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
            ['Administrator', 'admin@example.com', hashedPassword, 'admin']
          );
        } else {
          const db = getSqliteDb();
          const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
          stmt.run('Administrator', 'admin@example.com', hashedPassword, 'admin');
        }
        
        console.log('✅ Default admin user created');
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (err) {
      console.error('⚠️ Error managing default user:', err);
    }

    console.log(`✅ Database initialized successfully (${usePostgres ? 'PostgreSQL' : 'SQLite'})`);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
