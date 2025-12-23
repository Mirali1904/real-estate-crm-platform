import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ groups: [] });
    }

    const [rows]: any = await conn.execute(
      `
      SELECT g.id, g.name
      FROM groups g
      INNER JOIN group_members gm ON gm.group_id = g.id
      WHERE gm.agency_id = ?
      ORDER BY g.created_at DESC
      `,
      [Number(userId)]
    );

    return NextResponse.json({ groups: rows });
  } catch (err) {
    console.error("for-share groups error", err);
    return NextResponse.json({ groups: [] });
  }
}
