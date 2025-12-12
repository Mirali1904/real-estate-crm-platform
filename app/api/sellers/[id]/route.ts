// app/api/sellers/[id]/route.ts
import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

async function resolveParams(context: any) {
  try { return await context.params; } catch { return context.params; }
}

export async function GET(_req: Request, context: any) {
  const params = await resolveParams(context);
  const id = Number(params?.id || 0);
  if (!id) return NextResponse.json({ success: false, error: "missing id" }, { status: 400 });

  try {
    const [rows]: any = await conn.execute("SELECT * FROM sellers WHERE id = ?", [id]);
    if (!rows || rows.length === 0) return NextResponse.json({ success: false, error: "not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error("GET /api/sellers/[id]", err);
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 });
  }
}

export async function PUT(req: Request, context: any) {
  const params = await resolveParams(context);
  const id = Number(params?.id || 0);
  if (!id) return NextResponse.json({ success: false, error: "missing id" }, { status: 400 });

  const body = await req.json();

  // Allowed fields to update on sellers
  const allowedFields = [
    "status",
    "owner_user_id",
    "notes",
    "lat",
    "lng",
    "price",
    "bedrooms",
    "property_type",
    "property_address",
    "selected_buyer_id"
  ];

  const keys = Object.keys(body).filter(k => allowedFields.includes(k));
  if (keys.length === 0) {
    return NextResponse.json({ success: false, error: "nothing to update" }, { status: 400 });
  }

  // Build query and params
  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const paramsArr = keys.map(k => body[k]);

  // Append updated_at = NOW()
  const sql = `UPDATE sellers SET ${setClause}, updated_at = NOW() WHERE id = ?`;
  paramsArr.push(id);

  try {
    await conn.execute(sql, paramsArr);
    const [rows]: any = await conn.execute("SELECT * FROM sellers WHERE id = ?", [id]);
    return NextResponse.json({ success: true, seller: rows[0] });
  } catch (err: any) {
    console.error("PUT /api/sellers/[id] error:", err);
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: any) {
  const params = await resolveParams(context);
  const id = Number(params?.id || 0);
  if (!id) return NextResponse.json({ success: false, error: "missing id" }, { status: 400 });
  try {
    await conn.execute("DELETE FROM sellers WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/sellers/[id]", err);
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 });
  }
}
