import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* =========================
   MARK TASK AS DONE
========================= */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ IMPORTANT
    const taskId = Number(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Invalid task id" },
        { status: 400 }
      );
    }

    await conn.execute(
      `
      UPDATE tasks
      SET status = 'done'
      WHERE id = ?
      `,
      [taskId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UPDATE task error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
