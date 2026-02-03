import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Get all permissions grouped by module
export async function GET() {
  try {
    const [permissions] = await pool.query(
      "SELECT * FROM permissions ORDER BY module, name"
    );
    
    return NextResponse.json({ success: true, permissions });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}