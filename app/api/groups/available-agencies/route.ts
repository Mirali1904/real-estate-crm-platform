import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/*
  PURPOSE:
  - Show agencies (tenants) that are NOT already in the group
  - Exclude current user's tenant
*/

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const groupId = Number(searchParams.get("groupId"));
    const currentUserId = Number(searchParams.get("currentUserId"));

    if (!groupId || !currentUserId) {
      return NextResponse.json([]);
    }

    /* -------------------------
       GET CURRENT USER TENANT
    -------------------------- */
    const [userRows]: any = await conn.execute(
      `
      SELECT tenant_id
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [currentUserId]
    );

    if (!userRows.length || !userRows[0].tenant_id) {
      return NextResponse.json([]);
    }

    const currentTenantId = userRows[0].tenant_id;

    /* -------------------------
       FETCH AVAILABLE AGENCIES
    -------------------------- */
    const [rows]: any = await conn.execute(
      `
      SELECT DISTINCT
        u.tenant_id AS id,     -- 🔥 IMPORTANT: tenant_id as id
        u.name,
        u.email
      FROM users u
      WHERE u.role = 'ADMIN'
        AND u.tenant_id NOT IN (
          SELECT tenant_id
          FROM group_agencies
          WHERE group_id = ?
            AND status = 'active'
        )
        AND u.tenant_id != ?
      ORDER BY u.name ASC
      `,
      [groupId, currentTenantId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("available-agencies error:", error);
    return NextResponse.json([]);
  }
}
