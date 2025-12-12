// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import {conn} from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tenantId = Number(url.searchParams.get("tenantId") || "1");

  const [eRows]: any = await conn.execute(
    `SELECT COUNT(*) AS cnt FROM buyers WHERE tenant_id = ? AND status = 'ENQUIRY'`,
    [tenantId]
  );
  const enquiries = eRows[0]?.cnt || 0;

  const [aRows]: any = await conn.execute(
    `SELECT COUNT(*) AS cnt FROM leads WHERE tenant_id = ? AND status IN ('LEAD','ACTIVE')`,
    [tenantId]
  );
  const activeLeads = aRows[0]?.cnt || 0;

  const [cRows]: any = await conn.execute(
    `SELECT COUNT(*) AS cnt FROM leads WHERE tenant_id = ? AND status = 'CLOSED_WON'`,
    [tenantId]
  );
  const closings = cRows[0]?.cnt || 0;

  return NextResponse.json({ enquiries, activeLeads, closings });
}
