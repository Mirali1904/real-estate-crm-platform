import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const followUpId = Number(id);

    if (!followUpId) {
      return NextResponse.json(
        { error: "Invalid follow-up id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      follow_up_date,
      follow_up_time,
      note,
      follow_up_type,
      status,
    } = body;

    await conn.execute(
      `
      UPDATE follow_ups
      SET
        follow_up_date = ?,
        follow_up_time = ?,
        note = ?,
        follow_up_type = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        follow_up_date || null,
        follow_up_time || null,
        note || null,
        follow_up_type || null,
        status || "PENDING",
        followUpId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FOLLOW-UP EDIT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to edit follow-up" },
      { status: 500 }
    );
  }
}


/* =========================
   DELETE FOLLOW-UP (PERMANENT)
========================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const followUpId = Number(id);

    if (!followUpId) {
      return NextResponse.json(
        { error: "Invalid follow-up id" },
        { status: 400 }
      );
    }

    await conn.execute(
      `DELETE FROM follow_ups WHERE id = ?`,
      [followUpId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FOLLOW-UP DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete follow-up" },
      { status: 500 }
    );
  }
}
