import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // tumhara DB import

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");

  const [rows] = await db.query(
    `SELECT * FROM internal_remarks
     WHERE entity_type = ? AND entity_id = ?
     ORDER BY created_at DESC`,
    [entityType, entityId]
  );

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { entityType, entityId, remark, createdBy } = await req.json();

  await db.query(
    `INSERT INTO internal_remarks
     (entity_type, entity_id, remark, created_by)
     VALUES (?, ?, ?, ?)`,
    [entityType, entityId, remark, createdBy]
  );

  return NextResponse.json({ success: true });
}
    