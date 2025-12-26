import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const groupId = Number(resolvedParams.id);

    if (!groupId) {
      return NextResponse.json({ error: "Invalid group id" }, { status: 400 });
    }

   const [rows]: any = await conn.execute(
  `
  SELECT 
    g.id,
    g.name,
    g.description,
    g.created_by,
    u.name AS creator_name
  FROM groups g
  LEFT JOIN users u ON g.created_by = u.id
  WHERE g.id = ?
  `,
  [groupId]
);


    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Group fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 });
  }
}


