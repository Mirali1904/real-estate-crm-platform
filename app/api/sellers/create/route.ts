import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      tenantId,
      agentId,
      name,
      owner_contact,
      email,
      property_type,
      location,
      lat,
      lng,
      price,
      bedrooms,

      // ✅ NEW FIELDS
      looking_for,
      furnishing_preference,

      brokerage_type,
      brokerage_value,
      remarks,
    } = body;

    // ✅ BASIC VALIDATION
    if (!tenantId || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ GUARANTEE NAME
    const finalName =
      name?.trim() ||
      email?.split("@")[0] ||
      "Unknown Seller";

    // ✅ BROKERAGE VALIDATION
    if (
      brokerage_type === "percent" &&
      Number(brokerage_value) > 100
    ) {
      return NextResponse.json(
        { error: "Brokerage percentage cannot exceed 100" },
        { status: 400 }
      );
    }

    // ✅ INSERT SELLER
    const query = `
      INSERT INTO sellers (
        tenant_id,
        agent_id,
        name,
        owner_contact,
        email,
        property_type,
        location,
        lat,
        lng,
        price,
        bedrooms,

        looking_for,
        furnishing_preference,

        brokerage_type,
        brokerage_value,

        status,
        created_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        'LISTED',
        NOW()
      )
    `;

    await conn.execute(query, [
      tenantId,
      agentId || null,
      finalName,
      owner_contact || null,
      email || null,
      property_type || null,
      location,
      lat ?? null,
      lng ?? null,
      price ?? null,
      bedrooms ?? null,

      // ✅ NEW VALUES
      looking_for || "SELL",
      furnishing_preference || null,

      brokerage_type || "percent",
      brokerage_value ? Number(brokerage_value) : null,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create seller error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
