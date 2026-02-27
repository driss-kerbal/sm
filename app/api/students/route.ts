import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const students = db.prepare("SELECT * FROM students ORDER BY id DESC").all();
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const stmt = db.prepare(`
      INSERT INTO students (
        firstName, lastName, email, phone, dateOfBirth,
        address, city, postalCode, country, enrollmentDate, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
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
    );

    return NextResponse.json(
      { id: result.lastInsertRowid, ...body },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
