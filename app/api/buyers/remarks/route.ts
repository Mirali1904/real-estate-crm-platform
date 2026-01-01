import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const { buyerId, tenantId, remarks, updatedBy } = await req.json();

    if (!buyerId || !tenantId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // ✅ 1. UPDATE BUYER REMARKS (THIS WAS MISSING)
    await conn.execute(
      `
      UPDATE buyers
      SET remarks = ?
      WHERE id = ? AND tenant_id = ?
      `,
      [remarks, buyerId, tenantId]
    );

    // ✅ 2. ACTIVITY LOG (OPTIONAL BUT GOOD)
    await conn.execute(
      `
      INSERT INTO agent_activity_logs
        (tenant_id, agent_id, action_type, entity_type, entity_id, description)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        tenantId,
        updatedBy,
        "BUYER_REMARK_UPDATED",
        "buyer",
        buyerId,
        `Buyer remarks updated`,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Update remarks error:", e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
