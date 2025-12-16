import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* ----------------------------------------
   GET MATCHED BUYERS FOR A SELLER
----------------------------------------- */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sellerId = Number(id);

    const { searchParams } = new URL(req.url);
    const tenantId = Number(searchParams.get("tenantId"));

    if (!sellerId || !tenantId) {
      return NextResponse.json(
        { error: "Missing sellerId or tenantId" },
        { status: 400 }
      );
    }

    /* 1️⃣ Fetch seller */
    const [sellerRows]: any = await conn.execute(
      `
      SELECT
        id,
        price,
        bedrooms,
        lat,
        lng,
        status
      FROM sellers
      WHERE id = ?
        AND tenant_id = ?
        AND status = 'LISTED'
      `,
      [sellerId, tenantId]
    );

    if (sellerRows.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const seller = sellerRows[0];

    /* 2️⃣ Find matching buyers */
    const [buyers]: any = await conn.execute(
      `
      SELECT
        b.id,
        b.name,
        b.email,
        b.phone,
        b.budget_min,
        b.budget_max,
        b.bedrooms,
        b.radius_km,
        b.lat,
        b.lng,
        (
          6371 * ACOS(
            COS(RADIANS(b.lat))
            * COS(RADIANS(?))
            * COS(RADIANS(?) - RADIANS(b.lng))
            + SIN(RADIANS(b.lat))
            * SIN(RADIANS(?))
          )
        ) AS distance_km
      FROM buyers b
      WHERE b.tenant_id = ?
        AND b.status = 'ENQUIRY'
        AND b.bedrooms = ?
        AND ? BETWEEN b.budget_min AND b.budget_max
      HAVING distance_km <= b.radius_km
      ORDER BY distance_km ASC
      `,
      [
        seller.lat,
        seller.lng,
        seller.lat,
        tenantId,
        seller.bedrooms,
        seller.price,
      ]
    );

    return NextResponse.json({ matches: buyers });
  } catch (error) {
    console.error("Seller match error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
