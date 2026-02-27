import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Check if admin user already exists
    const existingAdmin = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get("admin@example.com");

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 200 }
      );
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const stmt = db.prepare(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
    );

    stmt.run("Administrator", "admin@example.com", hashedPassword, "admin");

    return NextResponse.json(
      { message: "Admin user created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup admin user" },
      { status: 500 }
    );
  }
}
