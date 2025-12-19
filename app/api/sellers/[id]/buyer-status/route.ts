import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* =================================================
   GET → FETCH BUYER STATUS FOR A SELLER
   (reverse of buyer → property-status)
================================================= */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const sellerId = Number(id);

    const tenantId = req.headers.get("x-tenant-id");

    if (!tenantId || !sellerId) {
      return NextResponse.json(
        { error: "Missing tenantId or sellerId" },
        { status: 400 }
      );
    }

    /* ---------------------------------------------
       buyer_property_status is the SAME TABLE
       We are just reading it from seller POV
    ---------------------------------------------- */
    const [rows]: any = await conn.execute(
      `
      SELECT
        buyer_id,
        status
      FROM buyer_property_status
      WHERE seller_id = ?
        AND tenant_id = ?
      `,
      [sellerId, tenantId]
    );

    return NextResponse.json({
      success: true,
      statuses: rows,
    });
  } catch (err) {
    console.error("Failed to fetch buyer status for seller", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
