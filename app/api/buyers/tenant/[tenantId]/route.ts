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

    const [rows] = await conn.execute(
      `
      SELECT *
      FROM buyers
      WHERE tenant_id = ?
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
