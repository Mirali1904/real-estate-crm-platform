import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId required" },
        { status: 400 }
      );
    }

    const [buyersRows] = await db.query<any[]>(
  "SELECT COUNT(*) AS count FROM buyers WHERE tenant_id=?",
  [tenantId]
);
const buyers = buyersRows[0];

const [sellersRows] = await db.query<any[]>(
  "SELECT COUNT(*) AS count FROM sellers WHERE tenant_id=?",
  [tenantId]
);
const sellers = sellersRows[0];

const [appointmentsRows] = await db.query<any[]>(
  "SELECT COUNT(*) AS count FROM appointments WHERE tenant_id=?",
  [tenantId]
);
const appointments = appointmentsRows[0];

const [tasksRows] = await db.query<any[]>(
  "SELECT COUNT(*) AS count FROM tasks WHERE tenant_id=? AND status='pending'",
  [tenantId]
);
const tasks = tasksRows[0];

    const usageGB =
  buyers.count * 0.5 +        //  increased
  sellers.count * 2 +         //  increased
  appointments.count * 0.2 +
  tasks.count * 0.1;          


    const cpuPercent = Math.min(
      25 + tasks.count * 5 + appointments.count * 3,
      95
    );

    return NextResponse.json({
      usageGB: Number(usageGB.toFixed(2)),
      spaceGB: 500,
      cpuPercent,
    });
  } catch (error) {
    console.error("Server load error:", error);
    return NextResponse.json(
      { error: "Failed to fetch server load" },
      { status: 500 }
    );
  }
}
