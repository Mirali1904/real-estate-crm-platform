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
    action_type,
    description,
    created_at
  FROM agent_activity_logs
  WHERE tenant_id = ?
    AND entity_type = ?
    AND entity_id = CAST(? AS CHAR)
  ORDER BY created_at DESC
  `,
  [tenantId, entityType, entityId]
);


    return NextResponse.json(rows);
  } catch (err) {
    console.error("activity logs fetch error", err);
    return NextResponse.json([], { status: 500 });
  }
}
