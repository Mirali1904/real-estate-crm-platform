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
    const tenantId = Number(req.headers.get("x-tenant-id"));

    if (!sellerId || !tenantId) {
      return NextResponse.json(
        { error: "Missing sellerId or tenantId" },
        { status: 400 }
      );
    }

    /* 1️⃣ Seller */
    const [sellerRows]: any = await conn.execute(
      `
      SELECT id, price, bedrooms, lat, lng
      FROM sellers
      WHERE id = ? AND tenant_id = ?
      `,
      [sellerId, tenantId]
    );

    if (sellerRows.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const seller = sellerRows[0];

    /* 2️⃣ ALL COMPATIBLE BUYERS */
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
        (
          6371 * ACOS(
            COS(RADIANS(b.lat))
            * COS(RADIANS(?))
            * COS(RADIANS(?) - RADIANS(b.lng))
            + SIN(RADIANS(b.lat))
            * SIN(RADIANS(?))
          )
        ) AS distance_km,
        ps.status AS property_status
      FROM buyers b
      LEFT JOIN buyer_property_status ps
        ON ps.buyer_id = b.id
       AND ps.seller_id = ?
       AND ps.tenant_id = ?
      WHERE b.tenant_id = ?
        AND b.bedrooms = ?
        AND ? BETWEEN b.budget_min AND b.budget_max
      HAVING distance_km <= b.radius_km
      ORDER BY distance_km ASC
      `,
      [
        seller.lat,
        seller.lng,
        seller.lat,
        sellerId,
        tenantId,
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
