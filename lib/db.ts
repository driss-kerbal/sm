import { Pool, QueryResult } from 'pg';
import path from 'path';
import bcrypt from 'bcryptjs';

// Determine which database to use FIRST
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;
const hasDatabaseUrl = !!process.env.DATABASE_URL;
const usePostgres = isVercel || hasDatabaseUrl; // Use PostgreSQL if on Vercel or DATABASE_URL is set

console.log(`🗄️  Database Mode: ${usePostgres ? 'PostgreSQL (Vercel-safe)' : 'SQLite (Local)'}`);

// ============= PostgreSQL Setup =============
let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('❌ DATABASE_URL is required for PostgreSQL');
  }

  pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
  });

  console.log('✅ PostgreSQL pool initialized');
  return pool;
}

// ============= SQLite Setup (Local only) =============
let sqliteDb: any = null;

export function getSqliteDb(): any {
  if (usePostgres) {
    throw new Error('Cannot use SQLite on Vercel. PostgreSQL is required.');
  }
  
  if (!sqliteDb) {
    try {
      // Dynamically require better-sqlite3 only when needed (local development)
      // @ts-ignore - better-sqlite3 only available locally
      const Database = require('better-sqlite3');
      const dbPath = path.join(process.cwd(), 'students.db');
      sqliteDb = new Database(dbPath);
      console.log(`✅ SQLite database connected: ${dbPath}`);
    } catch (err) {
      console.error('❌ Failed to initialize SQLite:', err);
      throw new Error('SQLite initialization failed. Are you on Vercel? Use PostgreSQL instead.');
    }
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
      console.error('❌ Database Query Error:', error);
      throw error;
    }
  } else {
    // SQLite query - convert to synchronous result
    try {
      const db = getSqliteDb();
      
      // Convert PostgreSQL syntax to SQLite
      let sqliteQuery = text;
      sqliteQuery = sqliteQuery.replace(/\$\d+/g, '?');
      sqliteQuery = sqliteQuery.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
      sqliteQuery = sqliteQuery.replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP');
      
      // Detect query type
      const isSelect = /^\s*SELECT/i.test(sqliteQuery);
      const isInsert = /^\s*INSERT/i.test(sqliteQuery);
      const isUpdate = /^\s*UPDATE/i.test(sqliteQuery);
      const isDelete = /^\s*DELETE/i.test(sqliteQuery);
      
      const stmt = db.prepare(sqliteQuery);
      
      let result;
      if (isSelect) {
        result = stmt.all(...(params || []));
      } else if (isInsert || isUpdate || isDelete) {
        // For INSERT/UPDATE/DELETE, use run() which returns info but not rows
        const info = stmt.run(...(params || []));
        // Return empty rows for these operations
        result = [];
      } else {
        // Default to all for other types
        result = stmt.all(...(params || []));
      }
      
      return {
        rows: Array.isArray(result) ? result : [result],
        rowCount: Array.isArray(result) ? result.length : (result ? 1 : 0),
        command: isSelect ? 'SELECT' : (isInsert ? 'INSERT' : (isUpdate ? 'UPDATE' : 'DELETE')),
        oid: 0,
        fields: [],
      } as QueryResult;
    } catch (error) {
      console.error('❌ SQLite Query Error:', error);
      throw error;
    }
  }
}

// ============= Database Initialization =============
export async function initializeDatabase() {
  try {
    if (usePostgres) {
      console.log('🔄 Initializing PostgreSQL database...');
      
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
      console.log('🔄 Initializing SQLite database...');
      const db = getSqliteDb();
      
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // Create default admin user if it doesn't exist
    try {
      const result = await query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
      
      if (result.rows.length === 0) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        await query(
          'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
          ['Administrator', 'admin@example.com', hashedPassword, 'admin']
        );
        console.log('✅ Default admin user created');
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (err) {
      console.error('⚠️ Error managing default user:', err);
    }

    console.log(`✅ Database initialized (${usePostgres ? 'PostgreSQL' : 'SQLite'})`);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
