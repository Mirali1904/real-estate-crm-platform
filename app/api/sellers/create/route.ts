import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      tenantId,
      name,               // 👈 seller name frontend se aa raha hai
      owner_contact,
      email,
      property_type,
      location,
      lat,
      lng,
      price,
      bedrooms,
    } = body;

    // ✅ validation
    if (!tenantId || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ GUARANTEE name is never null
    const finalName =
      name?.trim() ||
      email?.split("@")[0] ||
      "Unknown Seller";

    // ✅ INSERT WITH NAME COLUMN
    const query = `
      INSERT INTO sellers (
        tenant_id,
        name,
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LISTED', NOW())
    `;

    await conn.execute(query, [
      tenantId,
      finalName,          // 👈 YAHI MAIN FIX HAI
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
