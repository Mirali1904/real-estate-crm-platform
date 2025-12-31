import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    const { tenantId, sellerId, agentId } = await req.json();

    if (!tenantId || !sellerId || !agentId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await conn.execute(
      `
      UPDATE sellers
      SET agent_id = ?, assigned_at = NOW()
      WHERE id = ? AND tenant_id = ?
      `,
      [agentId, sellerId, tenantId]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Assign seller error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
