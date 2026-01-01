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

    /* 🔒 GET ROLE FROM DB (NOT FROM CLIENT) */
    const [userRows]: any = await conn.execute(
      `
      SELECT role
      FROM users
      WHERE id = ? AND tenant_id = ?
      `,
      [userId, tenantId]
    );

    if (userRows.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const role = userRows[0].role;

    let query = `
      SELECT 
        b.*,

        -- ✅ MATCH FRONTEND EXPECTATION
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

    /* 🔐 AGENT → ONLY OWN BUYERS */
    if (role === "AGENT") {
      query = `
        SELECT 
          b.*,

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
