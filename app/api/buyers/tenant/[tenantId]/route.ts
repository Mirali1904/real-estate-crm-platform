import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* =========================
   Safe params resolver
   ========================= */
async function resolveParams(ctx: any) {
  try {
    return await ctx.params;
  } catch {
    return ctx.params;
  }
}

/* ======================================================
   GET /api/buyers/tenant/[tenantId]
   Fetch buyers list
   ====================================================== */
export async function GET(_req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const tenantId = Number(params?.tenantId);

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
        name,
        email,
        phone,
        requirement,
        location,
        lat,
        lng,
        radius_km,
        budget_min,
        budget_max,
        bedrooms,
        status,
        created_at
      FROM buyers
      WHERE tenant_id = ?
      ORDER BY created_at DESC
      `,
      [tenantId]
    );

    return NextResponse.json({
      success: true,
      buyers: rows || [],
    });
  } catch (err: any) {
    console.error("GET buyers error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST /api/buyers/tenant/[tenantId]
   Create new buyer
   ====================================================== */
export async function POST(req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const tenantId = Number(params?.tenantId);

  if (!tenantId) {
    return NextResponse.json(
      { success: false, error: "Missing tenantId" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    const name = body.name?.trim();
    const phone = body.phone?.trim();
    const email = body.email || null;
    const requirement = body.requirement || null;
    const location = body.location || null;

    const lat = body.latitude ?? body.lat ?? null;
    const lng = body.longitude ?? body.lng ?? null;

    const radius_km = Number(body.radius ?? body.radius_km ?? 0);
    const budget_min = Number(body.budgetMin ?? body.budget_min);
    const budget_max = Number(body.budgetMax ?? body.budget_max);
    const bedrooms = Number(body.bedrooms ?? 0);

    if (!name || !phone || isNaN(budget_min) || isNaN(budget_max)) {
      return NextResponse.json(
        { success: false, error: "Invalid buyer data" },
        { status: 400 }
      );
    }

    await conn.execute(
      `
      INSERT INTO buyers (
        tenant_id,
        name,
        email,
        phone,
        requirement,
        location,
        lat,
        lng,
        radius_km,
        budget_min,
        budget_max,
        bedrooms,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ENQUIRY')
      `,
      [
        tenantId,
        name,
        email,
        phone,
        requirement,
        location,
        lat,
        lng,
        radius_km,
        budget_min,
        budget_max,
        bedrooms,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST buyer error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
