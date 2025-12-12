// app/api/buyers/create/route.ts
import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    tenantId, name, phone, email, requirement,
    location, lat, lng, radiusKm, budgetMin, budgetMax, bedrooms
  } = body;

  if (!tenantId || !name) return NextResponse.json({ success: false, error: "missing tenantId or name" }, { status: 400 });

  const q = `INSERT INTO buyers
    (tenant_id, name, email, phone, requirement, lat, lng, radius_km, budget_min, budget_max, bedrooms, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ENQUIRY', NOW())`;

  await conn.execute(q, [
    tenantId, name, email || null, phone || null, requirement || null,
    lat ?? null, lng ?? null, radiusKm ?? null, budgetMin ?? null, budgetMax ?? null, bedrooms ?? null
  ]);

  return NextResponse.json({ success: true });
}
