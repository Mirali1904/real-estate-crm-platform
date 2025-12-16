import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

async function resolveParams(ctx: any) {
  try {
    return await ctx.params;
  } catch {
    return ctx.params;
  }
}

// POST /api/buyers/[id]/interest
export async function POST(req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const buyerId = Number(params?.id || 0);

  if (!buyerId) {
    return NextResponse.json({ error: "Missing buyerId" }, { status: 400 });
  }

  const body = await req.json();
  const sellerId = Number(body.sellerId || 0);

  if (!sellerId) {
    return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
  }

  try {
    // 1️⃣ Buyer WON
    await conn.execute(
      `
      UPDATE buyers
      SET status = 'WON',
          selected_seller_id = ?
      WHERE id = ?
      `,
      [sellerId, buyerId]
    );

    // 2️⃣ Seller SOLD + lock to buyer
    await conn.execute(
      `
      UPDATE sellers
      SET status = 'SOLD',
          selected_buyer_id = ?
      WHERE id = ?
      `,
      [buyerId, sellerId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("INTEREST ERROR:", err);
    return NextResponse.json(
      { error: err.message || "DB error" },
      { status: 500 }
    );
  }
}
