import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/* GET: Fetch all compatible buyers for this seller with their status */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sellerId = Number(id);
  const tenantId = Number(req.headers.get("x-tenant-id"));

  if (!sellerId || !tenantId) {
    return NextResponse.json({ buyers: [] });
  }

  const conn = await pool.getConnection();

  try {
    // ✅ Fetch seller (ignore SOLD properties)
    const [[seller]]: any = await conn.execute(
      `
      SELECT price, bedrooms, lat, lng
      FROM sellers
      WHERE id = ?
        AND tenant_id = ?
        AND is_sold = 0
      `,
      [sellerId, tenantId]
    );

    if (!seller) {
      return NextResponse.json({ buyers: [] });
    }

    // ✅ Fetch matching buyers with per-seller status
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
        COALESCE(bps.status, 'New') AS status
      FROM buyers b
      LEFT JOIN buyer_property_status bps
        ON bps.buyer_id = b.id
        AND bps.seller_id = ?
        AND bps.tenant_id = ?
      WHERE b.tenant_id = ?
        AND b.is_deleted = 0
        AND b.bedrooms = ?
        AND ? BETWEEN b.budget_min AND b.budget_max
      `,
      [
        sellerId,
        tenantId,
        tenantId,
        seller.bedrooms,
        seller.price,
      ]
    );

    return NextResponse.json({ buyers: rows });
  } catch (err) {
    console.error("Seller buyer-status error:", err);
    return NextResponse.json({ buyers: [] }, { status: 500 });
  } finally {
    conn.release();
  }
}
