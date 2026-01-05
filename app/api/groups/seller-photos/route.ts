import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = Number(searchParams.get("sellerId"));

    if (!sellerId) {
      return NextResponse.json(
        { error: "sellerId required" },
        { status: 400 }
      );
    }

    const [rows]: any = await conn.execute(
      `
      SELECT id, photo_url
      FROM property_photos
      WHERE seller_id = ?
      ORDER BY id ASC
      `,
      [sellerId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Group seller photos error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
