import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("🏥 Health check started");
    
    // Initialize database
    initializeDatabase();
    const db = getDb();
    
    // Check if database tables exist
    const userTableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    ).get();
    
    const studentTableExists = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='students'"
    ).get();
    
    // Check admin user exists
    const adminExists = db.prepare(
      "SELECT COUNT(*) as count FROM users WHERE email = 'admin@example.com'"
    ).get() as any;
    
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        initialized: true,
        tables: {
          users: !!userTableExists,
          students: !!studentTableExists,
        },
        adminUserExists: (adminExists?.count || 0) > 0,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
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
