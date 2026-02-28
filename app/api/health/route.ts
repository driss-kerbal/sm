import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("🏥 Health check started");
    
    // Initialize database
    await initializeDatabase();
    
    // Determine database type
    const usePostgres = !!process.env.DATABASE_URL;
    const dbType = usePostgres ? "PostgreSQL" : "SQLite";
    
    let userTableExists = false;
    let studentTableExists = false;
    
    try {
      if (usePostgres) {
        // PostgreSQL table check
        const userTableResult = await query(
          `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='users') as exists`
        );
        const studentTableResult = await query(
          `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='students') as exists`
        );
        userTableExists = userTableResult.rows[0]?.exists;
        studentTableExists = studentTableResult.rows[0]?.exists;
      } else {
        // SQLite table check - use sqlite_master instead of information_schema
        const userTableResult = await query(
          `SELECT COUNT(*) as cnt FROM sqlite_master WHERE type='table' AND name='users'`
        );
        const studentTableResult = await query(
          `SELECT COUNT(*) as cnt FROM sqlite_master WHERE type='table' AND name='students'`
        );
        userTableExists = (userTableResult.rows[0]?.cnt || 0) > 0;
        studentTableExists = (studentTableResult.rows[0]?.cnt || 0) > 0;
      }
    } catch (err) {
      console.error("⚠️ Error checking tables:", err);
    }
    
    // Check admin user exists
    const adminResult = await query(
      "SELECT COUNT(*) as count FROM users WHERE email = $1",
      ["admin@example.com"]
    );
    
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        initialized: true,
        type: dbType,
        tables: {
          users: userTableExists,
          students: studentTableExists,
        },
        adminUserExists: (adminResult.rows[0]?.count || 0) > 0,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
    };
    
    console.log("✅ Health check passed:", JSON.stringify(health, null, 2));
    return NextResponse.json(health);
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
