import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "postId required" },
        { status: 400 }
      );
    }

    // delete responses first (FK safety)
    await conn.execute(
      "DELETE FROM group_post_responses WHERE post_id = ?",
      [postId]
    );

    // delete post
    await conn.execute(
      "DELETE FROM group_posts WHERE id = ?",
      [postId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete post error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
