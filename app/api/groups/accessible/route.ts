import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const tenantId = req.headers.get("x-tenant-id");
    const userId = req.headers.get("x-user-id");
    const agencyId = req.headers.get("x-agency-id");

    if (!tenantId || !userId || !agencyId) {
      return NextResponse.json({ groups: [] });
    }

    const [rows]: any = await conn.execute(
      `
      SELECT DISTINCT
        g.id,
        g.name,
        g.description,
        g.created_by,
        g.created_at,
        CASE
          WHEN g.created_by = ? THEN 'admin'
          ELSE 'member'
        END AS user_role
      FROM groups g
      LEFT JOIN group_agencies ga
        ON ga.group_id = g.id
        AND ga.agency_id = ?
        AND ga.status = 'active'
      WHERE
        g.tenant_id = ?
        AND (
          g.created_by = ?
          OR ga.agency_id IS NOT NULL
        )
      ORDER BY g.created_at DESC
      `,
      [userId, agencyId, tenantId, userId]
    );

    return NextResponse.json({ groups: rows });

  } catch (err) {
    console.error("GROUP FETCH ERROR", err);
    return NextResponse.json({ groups: [] });
  }
}
