import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* =========================
   GET TASKS (DASHBOARD)
========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = Number(searchParams.get("tenantId"));

    if (!tenantId) {
      return NextResponse.json([], { status: 200 });
    }

    const [rows]: any = await conn.execute(
      `
      SELECT
        id,
        title,
        due_date,
        priority,
        status
      FROM tasks
      WHERE tenant_id = ?
      ORDER BY
        status ASC,
        due_date ASC
      `,
      [tenantId]
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("GET tasks error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

/* =========================
   CREATE MANUAL TASK
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, title, dueDate } = body;

    if (!tenantId || !title) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    await conn.execute(
      `
      INSERT INTO tasks
        (tenant_id, title, related_type, related_id, due_date, priority, status)
      VALUES
        (?, ?, NULL, NULL, ?, 'medium', 'pending')
      `,
      [
        tenantId,
        title,
        dueDate || null,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST task error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
