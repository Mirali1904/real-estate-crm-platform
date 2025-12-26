// app/api/groups/accessible/route.ts
import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const tenantId = req.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json({ groups: [] });
    }

    const [rows]: any = await conn.execute(
      `
      SELECT DISTINCT
        g.id,
        g.name,
        g.description
      FROM groups g
      LEFT JOIN group_agencies ga
        ON ga.group_id = g.id
       AND ga.status = 'active'
      WHERE g.status = 'active'
        AND (
          g.tenant_id = ?          -- own groups
          OR ga.tenant_id = ?      -- shared groups
        )
      ORDER BY g.created_at DESC
      `,
      [tenantId, tenantId]
    );

    return NextResponse.json({ groups: rows });
  } catch (err) {
    console.error("GROUP FETCH ERROR", err);
    return NextResponse.json({ groups: [] });
  }
}
