import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* =================================================
   GET → FETCH SAVED PROPERTY STATUSES
================================================= */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const buyerId = Number(id);

    const tenantId = req.headers.get("x-tenant-id");

    if (!tenantId || !buyerId) {
      return NextResponse.json(
        { error: "Missing tenantId or buyerId" },
        { status: 400 }
      );
    }

    const [rows]: any = await conn.execute(
      `
      SELECT seller_id, status
      FROM buyer_property_status
      WHERE buyer_id = ?
      `,
      [buyerId]
    );

    return NextResponse.json({
      success: true,
      statuses: rows,
    });
  } catch (err) {
    console.error("Failed to fetch property status", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

/* =================================================
   POST → SAVE / UPDATE PROPERTY STATUS
================================================= */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const buyerId = Number(id);

    const tenantId = req.headers.get("x-tenant-id");

    if (!tenantId || !buyerId) {
      return NextResponse.json(
        { error: "Missing tenantId or buyerId" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { sellerId, status } = body;

    if (!sellerId || !status) {
      return NextResponse.json(
        { error: "sellerId and status required" },
        { status: 400 }
      );
    }

    /* ------------------------------------------------
       1️⃣ SAVE / UPDATE PROPERTY STATUS (PER PROPERTY)
    ------------------------------------------------- */
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

    /* ------------------------------------------------
       2️⃣ UPDATE SELLER STATUS
       ❗ ONLY WHEN DEAL IS CLOSED
    ------------------------------------------------- */
    if (status === "Deal Closed") {
      await conn.execute(
        `
        UPDATE sellers
        SET status = 'SOLD'
        WHERE id = ?
        `,
        [sellerId]
      );
    }

    /* ------------------------------------------------
       3️⃣ UPDATE BUYER STATUS (EXACT AS SELECTED)
       RULE:
       - Interested        → Interested
       - Shortlisted       → Shortlisted
       - Site Visit Planned→ Site Visit Planned
       - Deal Closed       → Deal Closed
       - Not Interested    → ENQUIRY
    ------------------------------------------------- */
    let buyerStatus: string;

    if (status === "Not Interested") {
      buyerStatus = "ENQUIRY";
    } else {
      buyerStatus = status;
    }

    await conn.execute(
      `
      UPDATE buyers
      SET status = ?
      WHERE id = ?
      `,
      [buyerStatus, buyerId]
    );

    return NextResponse.json({
      success: true,
      buyerStatus,
    });
  } catch (err) {
    console.error("Property status update failed", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
