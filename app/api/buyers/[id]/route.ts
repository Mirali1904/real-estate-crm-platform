import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* ---------------------------------
   GET BUYER BY ID
---------------------------------- */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const buyerId = Number(id);

    if (!buyerId) {
      return NextResponse.json(
        { error: "Invalid buyer id" },
        { status: 400 }
      );
    }

    const [rows]: any = await conn.execute(
      `
      SELECT
        id,
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

        -- 🔹 NEW FIELDS
        brokerage_amount,
        remarks,

        status,
        selected_seller_id
      FROM buyers
      WHERE id = ?
        AND is_deleted = 0
      `,
      [buyerId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("GET buyer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
