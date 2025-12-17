import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 🔐 tenant from logged-in user
    const tenantHeader = req.headers.get("x-tenant-id");
    const tenantId = tenantHeader ? Number(tenantHeader) : null;

    if (!tenantId) {
      return NextResponse.json(
        { error: "Unauthorized tenant" },
        { status: 401 }
      );
    }

    const {
      name,
      phone,
      email,
      requirement,
      location,
      lat,
      lng,
      radius_km,
      budget_min,
      budget_max,
      bedrooms,
    } = body;

    // ✅ MINIMUM REQUIRED (NO STRICT BLOCKING)
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    await conn.execute(
      `
      INSERT INTO buyers (
        tenant_id,
        name,
        phone,
        email,
        requirement,
        budget_min,
        budget_max,
        location,
        lat,
        lng,
        radius_km,
        bedrooms,
        status,
        is_deleted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ENQUIRY', 0)
      `,
      [
        tenantId,
        name,
        phone,
        email || null,
        requirement || null,
        Number(budget_min) || 0,
        Number(budget_max) || 0,
        location || null,
        Number(lat) || 0,
        Number(lng) || 0,
        Number(radius_km) || 0,
        bedrooms ? Number(bedrooms) : null,
      ]
    );

    return NextResponse.json(
      { message: "Buyer created successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create buyer failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
