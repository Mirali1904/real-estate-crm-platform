import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      tenantId,
      owner_contact,
      email,
      property_type,
      location,
      lat,
      lng,
      price,
      bedrooms,
    } = body;

    // ✅ REQUIRED VALIDATION
    if (!tenantId || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ INSERT (MATCHES DB COLUMNS)
    const query = `
      INSERT INTO sellers (
        tenant_id,
        owner_contact,
        email,
        property_type,
        location,
        lat,
        lng,
        price,
        bedrooms,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'LISTED', NOW())
    `;

    await conn.execute(query, [
      tenantId,
      owner_contact || null,
      email || null,
      property_type || null,
      location,
      lat ?? null,
      lng ?? null,
      price ?? null,
      bedrooms ?? null,
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
