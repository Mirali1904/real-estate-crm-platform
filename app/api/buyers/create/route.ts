import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
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
    } = body;

    /* --------------------------------
       BASIC VALIDATION
    --------------------------------- */
    if (
      !tenant_id ||
      !name ||
      !phone ||
      !budget_min ||
      !budget_max ||
      lat === undefined ||
      lng === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* --------------------------------
       INSERT BUYER (FULL & CORRECT)
    --------------------------------- */
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
        tenant_id,
        name,
        phone,
        email || null,
        requirement || null,
        budget_min,
        budget_max,
        location || null,
        lat,
        lng,
        radius_km ?? 0,   // 👈 IMPORTANT
        bedrooms ?? null,
      ]
    );

    return NextResponse.json({
      message: "Buyer created successfully",
    });
  } catch (error) {
    console.error("Create buyer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
