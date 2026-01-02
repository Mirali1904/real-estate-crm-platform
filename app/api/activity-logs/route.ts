import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const tenantId = searchParams.get("tenantId");
    const entityType = searchParams.get("entityType"); // buyer | seller
    const entityId = searchParams.get("entityId");

    if (!tenantId || !entityType || !entityId) {
      return NextResponse.json([], { status: 200 });
    }

    const [rows]: any = await conn.execute(
      `
      SELECT
        aal.id,
        aal.action_type,
        aal.description,
        aal.created_at,
        u.name AS performed_by_name,
        u.role AS performed_by_role
      FROM agent_activity_logs aal
      LEFT JOIN users u ON u.id = aal.agent_id
      WHERE aal.tenant_id = ?
        AND aal.entity_type = ?
        AND aal.entity_id = CAST(? AS CHAR)
      ORDER BY aal.created_at DESC
      `,
      [tenantId, entityType, entityId]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("activity logs fetch error", err);
    return NextResponse.json([], { status: 500 });
  }
}
