import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim().toLowerCase();
  const tenantId = Number(searchParams.get("tenantId"));

  if (!q || !tenantId) {
    return NextResponse.json({ results: [] });
  }

  const like = `%${q}%`;

  // 🔢 Detect numeric search (for budget)
  const numValue = !isNaN(Number(q)) ? Number(q) : null;

  // 🔢 Extract BHK number (1bhk, 2 bhk, 3BHK)
  const bhkMatch = q.match(/(\d+)\s*bhk/);
  const bhkNumber = bhkMatch ? Number(bhkMatch[1]) : null;

  let query = `
    SELECT
      id,
      name,
      email,
      phone,
      requirement,
      budget_min,
      budget_max,
      location,
      bedrooms,
      radius_km,
      status
    FROM buyers
    WHERE tenant_id = ?
      AND (
        name LIKE ?
        OR email LIKE ?
        OR phone LIKE ?
        OR requirement LIKE ?
        OR location LIKE ?
        OR notes LIKE ?
  `;

  const params: any[] = [
    tenantId,
    like,
    like,
    like,
    like,
    like,
    like,
  ];

  // 🔥 BHK search (1bhk, 2bhk)
  if (bhkNumber !== null) {
    query += ` OR bedrooms = ? `;
    params.push(bhkNumber);
  }

  // 💰 Budget range search (12000, 15000 etc)

if (numValue !== null) {
  query += ` OR budget_min <= ? `;
  params.push(numValue);
}


  query += `) ORDER BY created_at DESC`;

  const [rows]: any = await conn.query(query, params);

  return NextResponse.json({ results: rows });
}
