import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const groupId = Number(searchParams.get("groupId")); // optional
    const currentUserId = Number(searchParams.get("currentUserId"));

    if (!currentUserId) {
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

    if (!userRows.length) {
      return NextResponse.json([]);
    }

    const currentTenantId = userRows[0].tenant_id;

    /* -------------------------
       CREATE GROUP MODE (NO groupId)
    -------------------------- */
    if (!groupId) {
      const [rows]: any = await conn.execute(
        `
        SELECT DISTINCT
          u.tenant_id AS id,
          u.name,
          u.email
        FROM users u
        WHERE u.role = 'ADMIN'
          AND u.tenant_id != ?
        ORDER BY u.name ASC
        `,
        [currentTenantId]
      );

      return NextResponse.json(rows);
    }

    /* -------------------------
       GROUP DETAIL MODE
    -------------------------- */
    const [rows]: any = await conn.execute(
      `
      SELECT DISTINCT
        u.tenant_id AS id,
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
