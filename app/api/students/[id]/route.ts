import { initializeDatabase, query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Allow requests from localhost without auth for testing
    const isLocalhost = request.headers.get('host')?.includes('localhost') || request.headers.get('host')?.includes('127.0.0.1');
    
    if (!isLocalhost) {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await initializeDatabase();
    const { id } = await params;
    
    const result = await query("SELECT * FROM students WHERE id = $1", [id]);
    const student = result.rows[0];

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("❌ Failed to fetch student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Allow requests from localhost without auth for testing
    const isLocalhost = request.headers.get('host')?.includes('localhost') || request.headers.get('host')?.includes('127.0.0.1');
    
    if (!isLocalhost) {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await initializeDatabase();
    const { id } = await params;
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
      status,
    } = body;

    await query(`
      UPDATE students SET
        firstName = $1, lastName = $2, email = $3, phone = $4,
        dateOfBirth = $5, address = $6, city = $7, postalCode = $8,
        country = $9, status = $10, updatedAt = CURRENT_TIMESTAMP
      WHERE id = $11
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
      status || "active",
      id
    ]);

    // Fetch and return the updated student
    const result = await query("SELECT * FROM students WHERE id = $1", [id]);
    const updatedStudent = result.rows[0];
    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("❌ Failed to update student:", error);
    return NextResponse.json(
      { error: "Failed to update student", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Allow requests from localhost without auth for testing
    const isLocalhost = request.headers.get('host')?.includes('localhost') || request.headers.get('host')?.includes('127.0.0.1');
    
    if (!isLocalhost) {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await initializeDatabase();
    const { id } = await params;
    
    await query("DELETE FROM students WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Failed to delete student:", error);
    return NextResponse.json(
      { error: "Failed to delete student", details: String(error) },
      { status: 500 }
    );
  }
}
