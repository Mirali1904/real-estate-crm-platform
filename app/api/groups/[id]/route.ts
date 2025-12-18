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
      "SELECT id, name, description, created_by FROM groups WHERE id = ?",
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


