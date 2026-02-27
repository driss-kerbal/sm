import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("🏥 Health check started");
    
    // Initialize database
    await initializeDatabase();
    
    // Check database tables
    const userTableResult = await query(
      `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='users') as exists`
    );
    
    const studentTableResult = await query(
      `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='students') as exists`
    );
    
    const userTableExists = userTableResult.rows[0]?.exists;
    const studentTableExists = studentTableResult.rows[0]?.exists;
    
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
        type: "PostgreSQL",
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
