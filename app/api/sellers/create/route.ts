// app/api/sellers/create/route.ts
import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    tenantId, property_address, owner_contact, email, property_type,
    lat, lng, price, bedrooms
  } = body;

  if (!tenantId || !property_address) return NextResponse.json({ success: false, error: "missing tenantId or property_address" }, { status: 400 });

  const q = `INSERT INTO sellers
    (tenant_id, property_address, owner_contact, email, property_type, lat, lng, price, bedrooms, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'LISTED', NOW())`;

  await conn.execute(q, [
    tenantId, property_address, owner_contact || null, email || null, property_type || null,
    lat ?? null, lng ?? null, price ?? null, bedrooms ?? null
  ]);

  return NextResponse.json({ success: true });
}
