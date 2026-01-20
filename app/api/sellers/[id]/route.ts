// app/api/sellers/[id]/route.ts
import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

async function resolveParams(context: any) {
  try { return await context.params; } catch { return context.params; }
}

/* =========================
   GET SELLER BY ID
========================= */
export async function GET(_req: Request, context: any) {
  const params = await resolveParams(context);
  const id = Number(params?.id || 0);
  if (!id) {
    return NextResponse.json(
      { success: false, error: "missing id" },
      { status: 400 }
    );
  }

  try {
    const [rows]: any = await conn.execute(
      `
      SELECT
        id,
        tenant_id,
        name,
        email,
        owner_contact,
        property_type,
        location,
        lat,
        lng,
        price,
        bedrooms,

        brokerage_type,
        brokerage_value,


        status,
        selected_buyer_id
      FROM sellers
      WHERE id = ?
      `,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (err: any) {
    console.error("GET /api/sellers/[id]", err);
    return NextResponse.json(
      { success: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE SELLER
========================= */
export async function PUT(req: Request, context: any) {
  const params = await resolveParams(context);
  const id = Number(params?.id || 0);
  if (!id) {
    return NextResponse.json(
      { success: false, error: "missing id" },
      { status: 400 }
    );
  }

  const body = await req.json();

  // ✅ Allowed fields (brokerage & remarks added)
  const allowedFields = [
    "status",
    "owner_user_id",
    "lat",
    "lng",
    "price",
    "bedrooms",
    "property_type",
    "property_address",
    "selected_buyer_id",

    "brokerage_type",
"brokerage_value",

    
  ];

  const keys = Object.keys(body).filter(k => allowedFields.includes(k));

  if (keys.length === 0) {
    return NextResponse.json(
      { success: false, error: "nothing to update" },
      { status: 400 }
    );
  }

  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const paramsArr = keys.map(k => body[k]);

  const sql = `
    UPDATE sellers
    SET ${setClause}, updated_at = NOW()
    WHERE id = ?
  `;
  paramsArr.push(id);

  try {
    await conn.execute(sql, paramsArr);

    


    const [rows]: any = await conn.execute(
  `
  SELECT
    id,
    tenant_id,
    name,
    email,
    owner_contact,
    property_type,
    location,
    lat,
    lng,
    price,
    bedrooms,
    brokerage_type,
brokerage_value,

    status,
    selected_buyer_id
  FROM sellers
  WHERE id = ?
  `,
  [id]
);


    return NextResponse.json({ success: true, seller: rows[0] });
  } catch (err: any) {
    console.error("PUT /api/sellers/[id] error:", err);
    return NextResponse.json(
      { success: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE SELLER
========================= */
export async function DELETE(_req: Request, context: any) {
  const params = await resolveParams(context);
  const id = Number(params?.id || 0);

  if (!id) {
    return NextResponse.json(
      { success: false, error: "missing id" },
      { status: 400 }
    );
  }

  try {
    // 1️⃣ First delete property photos
    await conn.execute(
      "DELETE FROM property_photos WHERE seller_id = ?",
      [id]
    );

    // 2️⃣ Then delete seller
    await conn.execute(
      "DELETE FROM sellers WHERE id = ?",
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/sellers/[id]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

