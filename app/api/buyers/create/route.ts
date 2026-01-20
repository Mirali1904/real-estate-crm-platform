import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const tenantHeader = req.headers.get("x-tenant-id");
    const tenantId = tenantHeader ? Number(tenantHeader) : null;

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 401 }
      );
    }

    const body = await req.json();

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

      // ✅ NEW FIELDS
      looking_for,
      furnishing_preference,

      brokerage_type,
      brokerage_value,

      remarks,
      agentId,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone required" },
        { status: 400 }
      );
    }

    // ✅ looking_for validation
    if (
      looking_for &&
      !["BUY", "RENT"].includes(looking_for)
    ) {
      return NextResponse.json(
        { error: "Invalid looking_for value" },
        { status: 400 }
      );
    }

    // ✅ furnishing_preference validation
    if (
      furnishing_preference &&
      !["FULLY_FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"].includes(furnishing_preference)
    ) {
      return NextResponse.json(
        { error: "Invalid furnishing preference" },
        { status: 400 }
      );
    }

    if (
      brokerage_type === "percent" &&
      Number(brokerage_value) > 100
    ) {
      return NextResponse.json(
        { error: "Brokerage percentage cannot exceed 100" },
        { status: 400 }
      );
    }

    await conn.execute(
      `
      INSERT INTO buyers (
        tenant_id,
        agent_id,
        name,
        phone,
        email,
        requirement,

        looking_for,
        furnishing_preference,

        budget_min,
        budget_max,
        location,
        lat,
        lng,
        radius_km,
        bedrooms,
        brokerage_type,
        brokerage_value,
        status,
        is_deleted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ENQUIRY', 0)
      `,
      [
        tenantId,
        agentId || null,
        name,
        phone,
        email || null,
        requirement || null,

        looking_for || "BUY",          // default BUY
        furnishing_preference || null,

        Number(budget_min) || 0,
        Number(budget_max) || 0,
        location || null,
        Number(lat) || 0,
        Number(lng) || 0,
        Number(radius_km) || 0,
        bedrooms ? Number(bedrooms) : null,

        brokerage_type || null,
        brokerage_value ? Number(brokerage_value) : null,
      ]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Create buyer error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
