import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId required" }, { status: 400 });
  }

  // Get agents
  const [users]: any = await conn.query(
    `
    SELECT id
    FROM users
    WHERE tenant_id = ?
  `,
    [tenantId]
  );

  const data = [];

  for (const user of users) {
    const [[taskCount]]: any = await conn.query(
      `SELECT COUNT(*) as c FROM tasks WHERE tenant_id = ?`,
      [tenantId]
    );

    const [[followCount]]: any = await conn.query(
      `SELECT COUNT(*) as c FROM follow_ups WHERE tenant_id = ?`,
      [tenantId]
    );

    const [[appointmentCount]]: any = await conn.query(
      `SELECT COUNT(*) as c FROM appointments WHERE tenant_id = ?`,
      [tenantId]
    );

    const totalActions =
      taskCount.c + followCount.c + appointmentCount.c;

    data.push({
      x: totalActions,
      y: user.id,
    });
  }

  return NextResponse.json(data);
}
