import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* GET: Fetch all property statuses for this buyer */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const buyerId = Number(id);
    const tenantId = Number(req.headers.get("x-tenant-id"));

    if (!buyerId || !tenantId) {
      return NextResponse.json({ statuses: [] });
    }

    const [rows]: any = await conn.execute(
      `
      SELECT
        seller_id,
        status
      FROM buyer_property_status
      WHERE buyer_id = ?
        AND tenant_id = ?
      `,
      [buyerId, tenantId]
    );

    return NextResponse.json({
      success: true,
      statuses: rows,
    });
  } catch (err) {
    console.error("Buyer property-status GET error:", err);
    return NextResponse.json({ statuses: [] }, { status: 500 });
  }
}

/* POST: Update status for a specific property */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const buyerId = Number(id);
    const tenantId = Number(req.headers.get("x-tenant-id"));

    const { sellerId, status } = await req.json();

    if (!buyerId || !sellerId || !tenantId || !status) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await conn.execute(
      `
      INSERT INTO buyer_property_status
        (tenant_id, buyer_id, seller_id, status)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
      `,
      [tenantId, buyerId, sellerId, status]
    );

    /* Update buyer's overall status if needed */
    const [[buyer]]: any = await conn.execute(
      `SELECT status FROM buyers WHERE id = ? AND tenant_id = ?`,
      [buyerId, tenantId]
    );

    let newBuyerStatus = buyer?.status || "ENQUIRY";

    if (status === "Connected" || status === "In Progress") {
      newBuyerStatus = "IN_PROGRESS";
    } else if (status === "Site Visit Planned") {
      newBuyerStatus = "SITE_VISIT";
    } else if (status === "Interested" || status === "Contacted") {
      newBuyerStatus = "ACTIVE";
    }

    await conn.execute(
      `UPDATE buyers SET status = ? WHERE id = ? AND tenant_id = ?`,
      [newBuyerStatus, buyerId, tenantId]
    );

    return NextResponse.json({ 
      success: true,
      buyerStatus: newBuyerStatus
    });
  } catch (err) {
    console.error("Buyer property-status POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}