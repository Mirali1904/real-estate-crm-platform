import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const buyerId = searchParams.get("buyerId");
    const sellerId = searchParams.get("sellerId");

    // 🔒 Validation: at least one is required
    if (!buyerId && !sellerId) {
      return NextResponse.json(
        { message: "buyerId or sellerId is required" },
        { status: 400 }
      );
    }

    let rows: any;

    if (buyerId) {
      // 🔵 BUYER FOLLOW-UPS
      [rows] = await conn.query(
        `
        SELECT
          id,
          follow_up_type,
          follow_up_date,
          status,
          note,
          created_at
        FROM follow_ups
        WHERE buyer_id = ?
        ORDER BY follow_up_date ASC
        `,
        [buyerId]
      );
    } else {
      // 🟣 SELLER FOLLOW-UPS
      [rows] = await conn.query(
        `
        SELECT
          id,
          follow_up_type,
          follow_up_date,
          status,
          note,
          created_at
        FROM follow_ups
        WHERE seller_id = ?
        ORDER BY follow_up_date ASC
        `,
        [sellerId]
      );
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("FOLLOW_UP_LIST_ERROR", error);
    return NextResponse.json(
      { message: "Failed to fetch follow-ups" },
      { status: 500 }
    );
  }
}
