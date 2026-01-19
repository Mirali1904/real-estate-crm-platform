import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const qRaw = searchParams.get("q")?.trim();
  const tenantId = Number(searchParams.get("tenantId"));

  if (!qRaw || !tenantId) {
    return NextResponse.json({ results: [] });
  }

  const q = qRaw.toLowerCase();
  const like = `%${q}%`;

  // 🔢 Check if user typed a number (budget search)
  const budgetNumber = !isNaN(Number(q)) ? Number(q) : null;

  // 🏠 Extract BHK (1bhk, 2 bhk etc)
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

  // 🔥 BHK filter
  if (bhkNumber !== null) {
    query += ` OR bedrooms = ? `;
    params.push(bhkNumber);
  }

  // 💰 Budget filter (<= typed value)
  if (budgetNumber !== null) {
    query += ` OR budget_min <= ? `;
    params.push(budgetNumber);
  }

  query += `) ORDER BY created_at DESC`;

  const [rows]: any = await conn.query(query, params);

  return NextResponse.json({ results: rows });
}
