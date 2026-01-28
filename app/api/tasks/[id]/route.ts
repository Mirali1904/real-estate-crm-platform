import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* =========================
   DELETE TASK (WITH APPOINTMENT)
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

    /* =========================
       1. Get task relation
    ========================= */
    const [rows]: any = await conn.execute(
      `
      SELECT related_type, related_id
      FROM tasks
      WHERE id = ?
      `,
      [taskId]
    );

    const task = rows?.[0];

    /* =========================
       2. If task is from appointment → delete appointment
    ========================= */
    if (
      task &&
      task.related_type === "appointment" &&
      task.related_id
    ) {
      await conn.execute(
        `
        DELETE FROM appointments
        WHERE id = ?
        `,
        [task.related_id]
      );
    }

    /* =========================
       3. Delete task
    ========================= */
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
