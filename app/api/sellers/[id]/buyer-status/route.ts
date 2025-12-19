import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* =================================================
   GET → BUYERS FOR A SELLER (WITH STATUS)
   SOURCE OF TRUTH: buyer_property_status
================================================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sellerId = Number(id);

    const tenantId = Number(req.headers.get("x-tenant-id"));

    if (!sellerId || !tenantId) {
      return NextResponse.json({ buyers: [] });
    }

    const [rows]: any = await conn.execute(
      `
      SELECT
        b.id AS buyer_id,
        b.name,
        b.email,
        b.phone,
        b.budget_min,
        b.budget_max,
        b.radius_km,
        b.lat,
        b.lng,
        b.bedrooms,
        bps.status AS property_status,
        (
          6371 * ACOS(
            COS(RADIANS(b.lat))
            * COS(RADIANS(s.lat))
            * COS(RADIANS(s.lng) - RADIANS(b.lng))
            + SIN(RADIANS(b.lat))
            * SIN(RADIANS(s.lat))
          )
        ) AS distance_km
      FROM buyer_property_status bps
      JOIN buyers b ON b.id = bps.buyer_id
      JOIN sellers s ON s.id = bps.seller_id
      WHERE bps.seller_id = ?
        AND bps.tenant_id = ?
        AND b.is_deleted = 0
      ORDER BY
        FIELD(
          bps.status,
          'Deal Closed',
          'Site Visit Planned',
          'Shortlisted',
          'Interested',
          'New',
          'Not Interested'
        ),
        bps.updated_at DESC
      `,
      [sellerId, tenantId]
    );

    return NextResponse.json({ buyers: rows });
  } catch (err) {
    console.error("Seller buyer-status error:", err);
    return NextResponse.json({ buyers: [] }, { status: 500 });
  }
}
