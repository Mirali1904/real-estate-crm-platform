// app/api/buyers/tenant/[tenantId]/route.ts
import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

async function resolveParams(ctx: any) {
  try { return await ctx.params; } catch { return ctx.params; }
}

export async function GET(_req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const tenantId = Number(params?.tenantId || 0);
  if (!tenantId) {
    return NextResponse.json({ success: false, error: "Missing tenantId" }, { status: 400 });
  }

  try {
    const [rows]: any = await conn.execute(
      `SELECT id, tenant_id, name, email, phone, requirement, location, lat, lng, radius_km, budget_min, budget_max, bedrooms, status, created_at
       FROM buyers
       WHERE tenant_id = ?
       ORDER BY created_at DESC`,
      [tenantId]
    );

    return NextResponse.json({ success: true, buyers: rows || [] });
  } catch (err: any) {
    console.error("GET /api/buyers/tenant/:", err);
    return NextResponse.json({ success: false, error: err.message || "DB error" }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const tenantId = Number(params?.tenantId || 0);
  if (!tenantId) {
    return NextResponse.json({ success: false, error: "Missing tenantId" }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name;
  if (!name) return NextResponse.json({ success: false, error: "Missing name" }, { status: 400 });

  const {
    phone, email, requirement, location,
    lat, lng, radius_km, budget_min, budget_max, bedrooms
  } = body;

  try {
    const q = `INSERT INTO buyers
      (tenant_id, name, email, phone, requirement, location, lat, lng, radius_km, budget_min, budget_max, bedrooms, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ENQUIRY', NOW())`;

    const [result]: any = await conn.execute(q, [
      tenantId,
      name,
      email ?? null,
      phone ?? null,
      requirement ?? null,
      location ?? null,
      lat ?? null,
      lng ?? null,
      radius_km ?? null,
      budget_min ?? null,
      budget_max ?? null,
      bedrooms ?? null
    ]);

    const insertId = result?.insertId ?? null;
    return NextResponse.json({ success: true, id: insertId }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/buyers/tenant/:", err);
    return NextResponse.json({ success: false, error: err.message || "DB error" }, { status: 500 });
  }
}
