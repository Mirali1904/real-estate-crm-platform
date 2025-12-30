import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim();
  const tenantId = Number(searchParams.get("tenantId"));

  if (!q || !tenantId) {
    return NextResponse.json({ results: [] });
  }

  // ✅ starts with (professional + fast)
  const like = `${q}%`;

  const [rows]: any = await conn.query(
    `
    SELECT
      a.id,
      a.appointment_date,
      a.appointment_time,
      a.purpose,
      a.status,
      b.name AS customer_name
    FROM appointments a
    INNER JOIN buyers b ON b.id = a.customer_id
    WHERE a.tenant_id = ?
      AND (
        b.name LIKE ?
        OR a.purpose LIKE ?
      )
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `,
    [tenantId, like, like]
  );

  return NextResponse.json({ results: rows });
}
