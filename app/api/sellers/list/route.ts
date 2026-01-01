import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const tenantId = searchParams.get("tenantId");
    const userId = searchParams.get("userId");

    if (!tenantId || !userId) {
      return NextResponse.json({ success: true, sellers: [] });
    }

    /* 🔒 GET ROLE FROM DB (SAME AS BUYER) */
    const [userRows]: any = await conn.execute(
      `
      SELECT role
      FROM users
      WHERE id = ? AND tenant_id = ?
      `,
      [userId, tenantId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ success: true, sellers: [] });
    }

    const role = userRows[0].role;

    let query = `
     SELECT
  s.*,
  COALESCE(NULLIF(TRIM(s.owner_name), ''), s.name) AS owner_name,

  -- ✅ REQUIRED FOR FRONTEND
  u.id   AS assigned_agent_id,
  u.name AS assigned_agent_name

FROM sellers s
LEFT JOIN users u 
  ON u.id = s.agent_id
 AND u.tenant_id = s.tenant_id

      WHERE s.tenant_id = ?
      ORDER BY s.created_at DESC
    `;

    let params: any[] = [tenantId];

    /* 🔐 AGENT → ONLY OWN SELLERS */
    if (role === "AGENT") {
      query = `
       SELECT
  s.*,
  COALESCE(NULLIF(TRIM(s.owner_name), ''), s.name) AS owner_name,
  u.id   AS assigned_agent_id,
  u.name AS assigned_agent_name
FROM sellers s
LEFT JOIN users u 
  ON u.id = s.agent_id
 AND u.tenant_id = s.tenant_id
WHERE s.tenant_id = ?
  AND s.agent_id = ?

        ORDER BY s.created_at DESC
      `;
      params = [tenantId, userId];
    }

    const [rows]: any = await conn.execute(query, params);

    return NextResponse.json({
      success: true,
      sellers: rows,
    });
  } catch (error) {
    console.error("Fetch sellers error:", error);
    return NextResponse.json(
      { success: false, sellers: [] },
      { status: 500 }
    );
  }
}
