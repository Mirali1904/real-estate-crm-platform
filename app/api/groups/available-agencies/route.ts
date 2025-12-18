import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const groupId = Number(searchParams.get("groupId"));
    const currentUserId = Number(searchParams.get("currentUserId"));

    if (!groupId) {
      return NextResponse.json([]);
    }

    /**
     * RULES:
     * 1. Get ALL ADMINS from ALL TENANTS
     * 2. Exclude already added members
     * 3. Exclude current logged-in user
     */

    const [rows]: any = await conn.execute(
      `
      SELECT 
        u.id,
        u.name,
        u.email
      FROM users u
      WHERE u.role = 'ADMIN'
        AND u.id NOT IN (
          SELECT agency_id
          FROM group_agencies
          WHERE group_id = ?
        )
        AND u.id != ?
      `,
      [groupId, currentUserId || 0]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("available-agencies error:", error);
    return NextResponse.json([]);
  }
}
