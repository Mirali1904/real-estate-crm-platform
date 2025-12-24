import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) return NextResponse.json({ results: [] });

  const like = `%${q}%`;

  const [rows]: any = await conn.query(
    `
    SELECT id, name, description
    FROM groups
    WHERE name LIKE ? AND status = 'active'
    `,
    [like]
  );

  return NextResponse.json({ results: rows });
}
