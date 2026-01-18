import { NextResponse } from "next/server";
import { conn } from "@/lib/db"; 

const normalize = (d: any) =>
  new Date(d).toISOString().split("T")[0];


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId required" }, { status: 400 });
  }

  // Last 7 days list generate
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  // Tasks
  const [tasks]: any = await conn.query(
    `
    SELECT DATE(created_at) as day, COUNT(*) as count
    FROM tasks
    WHERE tenant_id = ?
      AND created_at >= CURDATE() - INTERVAL 6 DAY
    GROUP BY DATE(created_at)
  `,
    [tenantId]
  );

  // Follow-ups
  const [followUps]: any = await conn.query(
    `
    SELECT DATE(created_at) as day, COUNT(*) as count
    FROM follow_ups
    WHERE tenant_id = ?
      AND created_at >= CURDATE() - INTERVAL 6 DAY
    GROUP BY DATE(created_at)
  `,
    [tenantId]
  );

  // Appointments
  const [appointments]: any = await conn.query(
    `
    SELECT DATE(created_at) as day, COUNT(*) as count
    FROM appointments
    WHERE tenant_id = ?
      AND created_at >= CURDATE() - INTERVAL 6 DAY
    GROUP BY DATE(created_at)
  `,
    [tenantId]
  );

  // Merge all into chart format
  const result = days.map((day) => ({
  day,
  tasks: tasks.find((t: any) => normalize(t.day) === day)?.count || 0,
  followUps: followUps.find((f: any) => normalize(f.day) === day)?.count || 0,
  appointments:
    appointments.find((a: any) => normalize(a.day) === day)?.count || 0,
}));


  return NextResponse.json(result);
}






