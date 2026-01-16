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

      // 🔹 NEW FIELDS
      brokerage_amount,
      remarks,
       agentId,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone required" },
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
        budget_min,
        budget_max,
        location,
        lat,
        lng,
        radius_km,
        bedrooms,
        brokerage_amount,
       
        status,
        is_deleted
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  'ENQUIRY', 0)

      `,
      [
        tenantId,
        agentId || null, 
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

        // 🔹 NEW VALUES
        brokerage_amount || null,
        
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
