import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

async function resolveParams(ctx: any) {
  try {
    return await ctx.params;
  } catch {
    return ctx.params;
  }
}

// POST /api/sellers/[id]/interest
export async function POST(req: Request, ctx: any) {
  const params = await resolveParams(ctx);
  const sellerId = Number(params?.id);

  if (!sellerId) {
    return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
  }

  const body = await req.json();
  const buyerId = Number(body.buyerId);

  if (!buyerId) {
    return NextResponse.json({ error: "Missing buyerId" }, { status: 400 });
  }

  try {
    await conn.execute(
      `
      INSERT IGNORE INTO buyer_seller_interest (buyer_id, seller_id)
      VALUES (?, ?)
      `,
      [buyerId, sellerId]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("SELLER INTEREST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
