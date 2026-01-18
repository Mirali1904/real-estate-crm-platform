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

/* POST: Seller updates buyer-property status */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sellerId = Number(id);
  const tenantId = Number(req.headers.get("x-tenant-id"));

  const { buyerId, status } = await req.json();

  if (!sellerId || !buyerId || !tenantId || !status) {
    return NextResponse.json(
      { error: "Invalid data" },
      { status: 400 }
    );
  }

  const conn = await pool.getConnection();

  try {
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Seller status POST error:", err);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

