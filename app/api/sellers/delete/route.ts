// app/api/sellers/delete/route.ts
import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ success: false, error: "missing id" }, { status: 400 });

  await conn.execute("DELETE FROM sellers WHERE id = ?", [id]);
  return NextResponse.json({ success: true });
}
