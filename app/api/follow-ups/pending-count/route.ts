import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/**
 * GET pending follow-ups count
 * /api/follow-ups/pending-count?agentId=18&tenantId=10
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const agentId = Number(searchParams.get("agentId"));
    const tenantId = Number(searchParams.get("tenantId"));

    if (!agentId || !tenantId) {
      return NextResponse.json(
        { message: "agentId and tenantId required" },
        { status: 400 }
      );
    }

    const [rows]: any = await conn.execute(
      `
      SELECT COUNT(*) AS count
      FROM follow_ups
      WHERE agent_id = ?
        AND tenant_id = ?
        AND status = 'PENDING'
      `,
      [agentId, tenantId]
    );

    return NextResponse.json({ count: rows[0].count });
  } catch (error) {
    console.error("PENDING COUNT ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
