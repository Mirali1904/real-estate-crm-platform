import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
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
        b.id,
        b.tenant_id,
        b.name,
        b.phone,
        b.email,
        b.requirement,
        b.budget_min,
        b.budget_max,
        b.location,
        b.bedrooms,

        b.brokerage_amount,
       
        b.status,
        b.created_at,

        -- ✅ Assigned Agent
        u.id   AS assigned_agent_id,
        u.name AS assigned_agent_name

      FROM buyers b
      LEFT JOIN users u
        ON u.id = b.agent_id
       AND u.tenant_id = b.tenant_id

      WHERE b.tenant_id = ?
        AND b.is_deleted = 0

      ORDER BY b.created_at DESC
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
