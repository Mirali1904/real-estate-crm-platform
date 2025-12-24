import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim();
  const tenantId = searchParams.get("tenantId");

  if (!q || !tenantId) {
    return NextResponse.json({ results: [] });
  }

  const like = `%${q}%`;

  const [rows]: any = await conn.query(
    `
    SELECT *
    FROM sellers
    WHERE tenant_id = ?
      AND (
        name LIKE ?
        OR property_type LIKE ?
        OR location LIKE ?
      )
    ORDER BY created_at DESC
    `,
    [tenantId, like, like, like]
  );

  return NextResponse.json({ results: rows });
}
