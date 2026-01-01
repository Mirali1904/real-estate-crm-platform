import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const { sellerId, tenantId, remarks, updatedBy } = await req.json();

    if (!sellerId || !tenantId || !updatedBy) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // 1️⃣ UPDATE seller remarks
    await conn.execute(
      `
      UPDATE sellers
      SET remarks = ?, updated_at = NOW()
      WHERE id = ? AND tenant_id = ?
      `,
      [remarks || null, sellerId, tenantId]
    );

    // 2️⃣ ACTIVITY LOG
    await conn.execute(
      `
      INSERT INTO agent_activity_logs
        (tenant_id, agent_id, action_type, entity_type, entity_id, description)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        tenantId,
        updatedBy,
        "SELLER_REMARK_UPDATED",
        "seller",
        sellerId,
        "Seller remarks updated",
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Seller remarks error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
