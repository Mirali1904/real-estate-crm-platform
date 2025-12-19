import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * Buyer → Seller matching
 * Applies:
 * - tenant
 * - status = LISTED
 * - budget
 * - bedrooms
 * - distance (Haversine)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // ✅ unwrap params
  const { id } = await context.params;
  const buyerId = Number(id);

  // ✅ FIX: tenantId from HEADER first, fallback to query param
  const tenantId =
    Number(req.headers.get("x-tenant-id")) ||
    Number(req.nextUrl.searchParams.get("tenantId"));

  if (!buyerId || !tenantId) {
    return NextResponse.json({ matches: [] });
  }

  const conn = await pool.getConnection();

  try {
    // 1️⃣ Fetch buyer
    const [buyers]: any = await conn.execute(
      `
      SELECT
        id,
        budget_min,
        budget_max,
        bedrooms,
        lat,
        lng,
        radius_km
      FROM buyers
      WHERE id = ? AND tenant_id = ? AND is_deleted = 0
      `,
      [buyerId, tenantId]
    );

    if (!buyers.length) {
      return NextResponse.json({ matches: [] });
    }

    const buyer = buyers[0];

    // 2️⃣ Fetch sellers with distance
    const [rows]: any = await conn.execute(
      `
      SELECT
        s.*,
        (
          6371 * acos(
            cos(radians(?)) *
            cos(radians(s.lat)) *
            cos(radians(s.lng) - radians(?)) +
            sin(radians(?)) *
            sin(radians(s.lat))
          )
        ) AS distance_km
      FROM sellers s
      WHERE s.tenant_id = ?
        AND s.status = 'LISTED'
        AND s.price BETWEEN ? AND ?
        AND s.bedrooms = ?
      HAVING distance_km <= ?
      ORDER BY distance_km ASC
      `,
      [
        buyer.lat,
        buyer.lng,
        buyer.lat,
        tenantId,
        buyer.budget_min,
        buyer.budget_max,
        buyer.bedrooms,
        buyer.radius_km,
      ]
    );

    return NextResponse.json({ matches: rows });
  } catch (err) {
    console.error("Buyer match error:", err);
    return NextResponse.json({ matches: [] }, { status: 500 });
  } finally {
    conn.release();
  }
}
