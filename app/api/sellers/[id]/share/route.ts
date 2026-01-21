import { NextResponse } from "next/server";
import { conn } from "@/lib/db";
import crypto from "crypto";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 🔥 IMPORTANT FIX
    const { id } = await context.params;
    const sellerId = Number(id);

    if (!sellerId) {
      return NextResponse.json(
        { error: "Invalid seller id" },
        { status: 400 }
      );
    }

    // agent
    const userHeader = req.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = JSON.parse(userHeader);
    const agentId = user.id;

    // token
    const token = crypto.randomBytes(32).toString("hex");

    // expiry (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await conn.query(
      `
      INSERT INTO seller_share_links
      (seller_id, token, expires_at, created_by)
      VALUES (?, ?, ?, ?)
      `,
      [sellerId, token, expiresAt, agentId]
    );

   const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

return NextResponse.json({
  shareUrl: `${baseUrl}/share/property/${token}`,
});

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate share link" },
      { status: 500 }
    );
  }
}
