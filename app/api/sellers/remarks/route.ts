import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const { sellerId, tenantId, remarks, updatedBy } = await req.json();

    // ✅ FIXED VALIDATION
    if (sellerId == null || tenantId == null || updatedBy == null) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // 1️⃣ get previous remark
    const [prevRows]: any = await conn.execute(
      `SELECT remarks FROM sellers WHERE id = ? AND tenant_id = ?`,
      [sellerId, tenantId]
    );

    const previousRemark = prevRows?.[0]?.remarks || "";

    // 2️⃣ update seller
    await conn.execute(
      `
      UPDATE sellers
      SET remarks = ?, updated_at = NOW()
      WHERE id = ? AND tenant_id = ?
      `,
      [remarks || null, sellerId, tenantId]
    );

    // 3️⃣ activity description
    const description = previousRemark
      ? `Seller remarks updated\nFrom: ${previousRemark}\nTo: ${remarks}`
      : `Seller remarks added: ${remarks}`;

    // 4️⃣ activity log
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
        description,
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
