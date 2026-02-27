import { initializeDatabase, query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initializeDatabase();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query("SELECT * FROM students ORDER BY id DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("❌ Failed to fetch students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized
    await initializeDatabase();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      postalCode,
      country,
      enrollmentDate,
    } = body;

    if (!firstName || !lastName || !email || !enrollmentDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query(`
      INSERT INTO students (
        firstName, lastName, email, phone, dateOfBirth,
        address, city, postalCode, country, enrollmentDate, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      firstName,
      lastName,
      email,
      phone || null,
      dateOfBirth || null,
      address || null,
      city || null,
      postalCode || null,
      country || null,
      enrollmentDate,
      "active"
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("❌ Failed to create student:", error);
    return NextResponse.json(
      { error: "Failed to create student", details: String(error) },
      { status: 500 }
    );
  }
}
