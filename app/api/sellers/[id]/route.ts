// app/api/sellers/[id]/route.ts
import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

async function resolveParams(ctx: any) {
  try { return await ctx.params; } catch { return ctx.params; }
}

export async function GET(_req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const id = Number(params?.id || 0);
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

  try {
    const [rows]: any = await conn.execute("SELECT * FROM sellers WHERE id = ?", [id]);
    if (!rows || rows.length === 0) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error("GET /api/sellers/[id]:", err);
    return NextResponse.json({ success: false, error: err.message || "DB error" }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const id = Number(params?.id || 0);
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  const allowedFields = ["status","owner_user_id","notes","lat","lng","price","bedrooms","property_type","location","name","phone","email"];
  const keys = Object.keys(body).filter(k => allowedFields.includes(k));
  if (keys.length === 0) return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const paramsArr = keys.map(k => body[k]);
  paramsArr.push(id);

  try {
    await conn.execute(`UPDATE sellers SET ${setClause}, updated_at = NOW() WHERE id = ?`, paramsArr);
    const [rows]: any = await conn.execute("SELECT * FROM sellers WHERE id = ?", [id]);
    return NextResponse.json({ success: true, seller: rows[0] });
  } catch (err: any) {
    console.error("PUT /api/sellers/[id]:", err);
    return NextResponse.json({ success: false, error: err.message || "DB error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const id = Number(params?.id || 0);
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

  try {
    await conn.execute("DELETE FROM sellers WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/sellers/[id]:", err);
    return NextResponse.json({ success: false, error: err.message || "DB error" }, { status: 500 });
  }
}
