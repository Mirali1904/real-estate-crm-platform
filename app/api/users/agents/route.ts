import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json([], { status: 200 });
    }

    const [rows]: any = await conn.execute(
      `
      SELECT id, name
      FROM users
      WHERE tenant_id = ?
        AND role IN ('ADMIN', 'AGENT')
      `,
      [tenantId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch agents error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
