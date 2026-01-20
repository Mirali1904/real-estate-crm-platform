import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const tenantId = searchParams.get("tenantId");
    const userId = searchParams.get("userId");

    if (!tenantId || !userId) {
      return NextResponse.json([], { status: 200 });
    }

    // 🔒 GET USER ROLE
    const [userRows]: any = await conn.execute(
      `SELECT role FROM users WHERE id = ? AND tenant_id = ?`,
      [userId, tenantId]
    );

    if (!userRows.length) {
      return NextResponse.json([], { status: 200 });
    }

    const role = userRows[0].role;

    let query = `
      SELECT
        b.id,
        b.name,
        b.email,
        b.phone,
        b.requirement,

        -- ✅ NEW FIELDS
        b.looking_for,
        b.furnishing_preference,

        b.budget_min,
        b.budget_max,
        b.location,
        b.lat,
        b.lng,
        b.radius_km,
        b.bedrooms,
        b.status,

        -- ✅ BROKERAGE
        b.brokerage_type,
        b.brokerage_value,

        -- 🔹 LATEST BUYER REMARK
        (
          SELECT ir.remark
          FROM internal_remarks ir
          WHERE ir.entity_type = 'buyer'
            AND ir.entity_id = b.id
          ORDER BY ir.created_at DESC
          LIMIT 1
        ) AS remarks,

        u.id   AS assigned_agent_id,
        u.name AS assigned_agent_name

      FROM buyers b
      LEFT JOIN users u
        ON u.id = b.agent_id
       AND u.tenant_id = b.tenant_id

      WHERE b.tenant_id = ?
        AND b.is_deleted = 0

      ORDER BY b.created_at DESC
    `;

    let params: any[] = [tenantId];

    // 🔐 AGENT → ONLY OWN BUYERS
    if (role === "AGENT") {
      query = `
        SELECT
          b.id,
          b.name,
          b.email,
          b.phone,
          b.requirement,

          -- ✅ NEW FIELDS
          b.looking_for,
          b.furnishing_preference,

          b.budget_min,
          b.budget_max,
          b.location,
          b.lat,
          b.lng,
          b.radius_km,
          b.bedrooms,
          b.status,

          -- ✅ BROKERAGE
          b.brokerage_type,
          b.brokerage_value,

          (
            SELECT ir.remark
            FROM internal_remarks ir
            WHERE ir.entity_type = 'buyer'
              AND ir.entity_id = b.id
            ORDER BY ir.created_at DESC
            LIMIT 1
          ) AS remarks,

          u.id   AS assigned_agent_id,
          u.name AS assigned_agent_name

        FROM buyers b
        LEFT JOIN users u
          ON u.id = b.agent_id
         AND u.tenant_id = b.tenant_id

        WHERE b.tenant_id = ?
          AND b.agent_id = ?
          AND b.is_deleted = 0

        ORDER BY b.created_at DESC
      `;
      params = [tenantId, userId];
    }

    const [rows]: any = await conn.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch buyers error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
