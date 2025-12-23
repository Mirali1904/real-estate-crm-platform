import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const rawUser = req.headers.get("x-user");
    if (!rawUser) {
      return NextResponse.json({ groups: [] });
    }

    const user = JSON.parse(rawUser);

    // 🔥 IMPORTANT
    const tenantId = user.tenantId || user.tenant_id;

    if (!tenantId) {
      return NextResponse.json({ groups: [] });
    }

    const [rows]: any = await conn.execute(
      `
      SELECT DISTINCT g.id, g.name
      FROM groups g
      LEFT JOIN group_agencies ga ON ga.group_id = g.id
      WHERE 
        g.tenant_id = ?
        OR ga.agency_id = ?
      ORDER BY g.created_at DESC
      `,
      [tenantId, tenantId]
    );

    return NextResponse.json({ groups: rows });
  } catch (err) {
    console.error("accessible groups error", err);
    return NextResponse.json({ groups: [] });
  }
}
