import { initializeDatabase, query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    console.log("🔧 Setup GET endpoint called");
    await initializeDatabase();
    return NextResponse.json({ 
      message: "Database initialized successfully",
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Setup GET error:", error);
    return NextResponse.json(
      { error: "Database initialization failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Setup POST endpoint called");
    
    // Initialize database first
    await initializeDatabase();

    // Check if admin user already exists
    const result = await query("SELECT * FROM users WHERE email = $1", ["admin@example.com"]);
    
    if (result.rows.length > 0) {
      console.log("ℹ️ Admin user already exists");
      return NextResponse.json(
        { message: "Admin user already exists", timestamp: new Date().toISOString() },
        { status: 200 }
      );
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
      ["Administrator", "admin@example.com", hashedPassword, "admin"]
    );

    console.log("✅ Admin user created successfully");
    return NextResponse.json(
      { 
        message: "Admin user created successfully",
        email: "admin@example.com",
        timestamp: new Date().toISOString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Setup POST error:", error);
    return NextResponse.json(
      { error: "Failed to setup admin user", details: String(error) },
      { status: 500 }
    );
  }
}