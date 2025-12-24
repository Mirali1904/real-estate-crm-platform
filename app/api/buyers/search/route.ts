import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim();
  const tenantId = Number(searchParams.get("tenantId"));

  if (!q || !tenantId) {
    return NextResponse.json({ results: [] });
  }

  // ✅ STARTS WITH (NOT contains)
  const like = `${q}%`;

  const [rows]: any = await conn.query(
    `
    SELECT id, name, email, phone, budget_min, budget_max, status
    FROM buyers
    WHERE tenant_id = ?
      AND (
        name  LIKE ?
        OR email LIKE ?
        OR phone LIKE ?
      )
    ORDER BY name ASC
    `,
    [tenantId, like, like, like]
  );

  return NextResponse.json({ results: rows });
}
