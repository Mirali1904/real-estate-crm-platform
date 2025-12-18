import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

// GET group members
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = Number(searchParams.get("groupId"));

  const [rows]: any = await conn.execute(
    `
    SELECT 
      ga.id,
      ga.agency_id,
      u.name,
      u.email,
      ga.status,
      ga.joined_at
    FROM group_agencies ga
    JOIN users u ON u.id = ga.agency_id
    WHERE ga.group_id = ?
    `,
    [groupId]
  );

  return NextResponse.json(rows);
}

// ADD member
export async function POST(req: Request) {
  const body = await req.json();
  const { groupId, agencyId } = body;

  // prevent duplicate
  const [exists]: any = await conn.execute(
    `
    SELECT id FROM group_agencies
    WHERE group_id = ? AND agency_id = ?
    `,
    [groupId, agencyId]
  );

  if (exists.length > 0) {
    return NextResponse.json({ message: "Already added" });
  }

  // get tenantId
  const [[user]]: any = await conn.execute(
    `SELECT tenant_id FROM users WHERE id = ?`,
    [agencyId]
  );

  await conn.execute(
    `
    INSERT INTO group_agencies
      (group_id, agency_id, tenant_id, status)
    VALUES (?, ?, ?, 'active')
    `,
    [groupId, agencyId, user.tenant_id]
  );

  return NextResponse.json({ message: "Added" });
}

// REMOVE member
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = Number(searchParams.get("groupId"));
  const agencyId = Number(searchParams.get("agencyId"));

  await conn.execute(
    `
    DELETE FROM group_agencies
    WHERE group_id = ? AND agency_id = ?
    `,
    [groupId, agencyId]
  );

  return NextResponse.json({ success: true });
}
