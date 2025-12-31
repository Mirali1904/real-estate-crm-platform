// app/api/sellers/tenant/[tenantId]/route.ts
import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

async function resolveParams(ctx: any) {
  try {
    return await ctx.params;
  } catch {
    return ctx.params;
  }
}

/* =========================
   GET SELLERS BY TENANT
========================= */
export async function GET(_req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const tenantId = Number(params?.tenantId || 0);

  if (!tenantId) {
    return NextResponse.json(
      { success: false, error: "Missing tenantId" },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await conn.execute(
      `
      SELECT
        id,
        tenant_id,

        -- ✅ FIXED: real seller name
       TRIM(owner_name) AS owner_name,

        phone AS owner_contact,
        email AS owner_email,

        property_type,
        location,
        lat,
        lng,
        price,
        bedrooms,

        brokerage_amount,
        remarks,

        status,
        created_at
      FROM sellers
      WHERE tenant_id = ?
      ORDER BY created_at DESC
      `,
      [tenantId]
    );

    return NextResponse.json({ success: true, sellers: rows || [] });
  } catch (err: any) {
    console.error("GET /api/sellers/tenant/:", err);
    return NextResponse.json(
      { success: false, error: err.message || "DB error" },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE SELLER
========================= */
export async function POST(req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const tenantId = Number(params?.tenantId || 0);

  if (!tenantId) {
    return NextResponse.json(
      { success: false, error: "Missing tenantId" },
      { status: 400 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  /* ✅ FIXED: seller name resolution */
  const ownerName =
    body.owner_name ??
    body.ownerName ??
    body.property_address ??
    body.name ??
    null;

  const ownerContact = body.owner_contact ?? body.phone ?? null;
  const email = body.email ?? null;
  const propertyType = body.property_type ?? body.propertyType ?? null;
  const lat = body.lat ?? null;
  const lng = body.lng ?? null;
  const price = body.price ?? null;
  const bedrooms = body.bedrooms ?? null;
  const location = body.location ?? null;

  const brokerage_amount = body.brokerage_amount ?? null;
  const remarks = body.remarks ?? null;

  if (!ownerName) {
    return NextResponse.json(
      { success: false, error: "Missing seller name" },
      { status: 400 }
    );
  }

  try {
    const q = `
      INSERT INTO sellers (
        tenant_id,
        owner_name,
        phone,
        email,
        property_type,
        location,
        lat,
        lng,
        price,
        bedrooms,
        brokerage_amount,
        remarks,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LISTED', NOW())
    `;

    const [result]: any = await conn.execute(q, [
      tenantId,
      ownerName,
      ownerContact,
      email,
      propertyType,
      location,
      lat,
      lng,
      price,
      bedrooms,
      brokerage_amount,
      remarks,
    ]);

    return NextResponse.json(
      { success: true, id: result?.insertId ?? null },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/sellers/tenant/:", err);
    return NextResponse.json(
      { success: false, error: err.message || "DB error" },
      { status: 500 }
    );
  }
}
