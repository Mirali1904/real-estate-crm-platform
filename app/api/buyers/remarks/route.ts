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

    // 🔹 1. GET PREVIOUS REMARK
    const [prevRows]: any = await conn.execute(
      `SELECT remarks FROM buyers WHERE id = ? AND tenant_id = ?`,
      [buyerId, tenantId]
    );

    const previousRemark = prevRows?.[0]?.remarks || "";

    // 🔹 2. UPDATE BUYER
    await conn.execute(
      `
      UPDATE buyers
      SET remarks = ?
      WHERE id = ? AND tenant_id = ?
      `,
      [remarks, buyerId, tenantId]
    );

    // 🔹 3. ACTIVITY DESCRIPTION
    const description = previousRemark
      ? `Buyer remarks updated
From: ${previousRemark}
To: ${remarks}`
      : `Buyer remarks added: ${remarks}`;

    // 🔹 4. ACTIVITY LOG
    await conn.execute(
      `
      INSERT INTO agent_activity_logs
        (tenant_id, agent_id, action_type, entity_type, entity_id, description)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        tenantId,
        updatedBy || null,
        "BUYER_REMARK_UPDATED",
        "buyer",
        buyerId,
        description,
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
