import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* =========================
   DELETE TASK (PERMANENT)
========================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Invalid task id" },
        { status: 400 }
      );
    }

    await conn.execute(
      `
      DELETE FROM tasks
      WHERE id = ?
      `,
      [taskId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
