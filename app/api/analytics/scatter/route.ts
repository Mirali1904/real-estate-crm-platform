import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json(
      { error: "tenantId required" },
      { status: 400 }
    );
  }

  const [rows]: any = await conn.query(
    `
    SELECT 
      u.id AS userId,
      u.name AS name,

      /* TASKS → NO user_id, so count ALL tenant tasks */
      (
        SELECT COUNT(*) 
        FROM tasks t 
        WHERE t.tenant_id = u.tenant_id
      ) AS tasks,

      /* FOLLOW UPS → agent_id = user */
      (
        SELECT COUNT(*) 
        FROM follow_ups f 
        WHERE f.agent_id = u.id 
          AND f.tenant_id = u.tenant_id
      ) AS followUps,

      /* APPOINTMENTS → user_id */
      (
        SELECT COUNT(*) 
        FROM appointments a 
        WHERE a.user_id = u.id 
          AND a.tenant_id = u.tenant_id
      ) AS appointments

    FROM users u
    WHERE u.tenant_id = ?
    `,
    [tenantId]
  );

  const data = rows
    .map((r: any) => {
      const total =
        Number(r.tasks) +
        Number(r.followUps) +
        Number(r.appointments);

      return total > 0
        ? {
            x: total,
            y: r.userId,
            name: r.name,
          }
        : null;
    })
    .filter(Boolean);

  return NextResponse.json(data);
}
