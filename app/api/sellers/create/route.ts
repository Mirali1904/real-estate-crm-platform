import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      tenantId,
      agentId, 
      name,               // seller name
      owner_contact,
      email,
      property_type,
      location,
      lat,
      lng,
      price,
      bedrooms,

      // 🔹 NEW (same as buyer)
      brokerage_amount,
      remarks,
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

    // ✅ INSERT (with brokerage & remarks)
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

        brokerage_amount,
       

        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  'LISTED', NOW())
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

      // 🔹 NEW VALUES
      brokerage_amount || null,
      
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
