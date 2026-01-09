import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ IMPORTANT FIX
    const { id } = await context.params;
    const followUpId = Number(id);

    if (!followUpId) {
      return NextResponse.json(
        { error: "Invalid follow-up id" },
        { status: 400 }
      );
    }

    const [result]: any = await conn.execute(
      `UPDATE follow_ups
       SET status = 'DONE', updated_at = NOW()
       WHERE id = ?`,
      [followUpId]
    );

    

    return NextResponse.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("FOLLOW-UP UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update follow-up" },
      { status: 500 }
    );
  }
}
