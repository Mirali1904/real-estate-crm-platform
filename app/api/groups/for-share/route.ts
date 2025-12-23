import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/**
 * GET /api/groups/for-share
 * Return ALL active groups (for sharing buyers/sellers)
 */
export async function GET() {
  try {
    const [rows]: any = await conn.execute(
      `
      SELECT 
        id,
        name
      FROM groups
      WHERE status = 'active'
      ORDER BY created_at DESC
      `
    );

    return NextResponse.json({
      success: true,
      groups: rows,
    });
  } catch (err) {
    console.error("for-share groups error", err);

    return NextResponse.json({
      success: false,
      groups: [],
    });
  }
}
