import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const groupId = Number(searchParams.get("groupId"));
    const tenantId = Number(searchParams.get("tenantId"));
    const currentUserId = Number(searchParams.get("currentUserId"));

    if (!groupId || !tenantId) {
      return NextResponse.json([]);
    }

    const [rows]: any = await conn.execute(
      `
      SELECT 
        u.id,
        u.name,
        u.email
      FROM users u
      WHERE 
        u.role = 'ADMIN'
        AND u.tenant_id = ?
        AND u.id NOT IN (
          SELECT user_id
          FROM group_members
          WHERE group_id = ?
        )
        AND u.id != ?
      ORDER BY u.name ASC
      `,
      [tenantId, groupId, currentUserId || 0]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("available-members error", err);
    return NextResponse.json([]);
  }
}
