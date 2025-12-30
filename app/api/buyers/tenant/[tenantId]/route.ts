import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    // ✅ MUST await params
    const { tenantId } = await params;
    const tenantIdNum = Number(tenantId);

    if (!tenantIdNum) {
      return NextResponse.json(
        { error: "Invalid tenant id" },
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
        bedrooms,

        -- 🔹 NEW FIELDS (IMPORTANT)
        brokerage_amount,
        remarks,

        status,
        created_at
      FROM buyers
      WHERE tenant_id = ?
        AND is_deleted = 0
      ORDER BY created_at DESC
      `,
      [tenantIdNum]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching buyers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
