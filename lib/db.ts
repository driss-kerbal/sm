import { Pool, QueryResult } from 'pg';
import bcrypt from 'bcryptjs';

// PostgreSQL connection pool (works on Vercel)
let pool: Pool | null = null;

// Detect if we're in production on Vercel
const isProduction = process.env.NODE_ENV === 'production';
const isDatabaseUrl = !!process.env.DATABASE_URL;

export function getPool(): Pool {
  if (pool) return pool;

  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // Local development fallback
    connectionString = process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5432/students_db';
    console.log('⚠️ Using local PostgreSQL connection');
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

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const pool_ = getPool();
  try {
    const result = await pool_.query(text, params);
    return result;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error;
  }
}

// Initialize database tables and default user
export async function initializeDatabase() {
  try {
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

    console.log('✅ PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
