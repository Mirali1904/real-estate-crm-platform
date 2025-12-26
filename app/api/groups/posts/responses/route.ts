import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* ================= GET RESPONSES ================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = Number(searchParams.get("postId"));

    if (!postId) {
      return NextResponse.json(
        { error: "postId required" },
        { status: 400 }
      );
    }

    const [rows]: any = await conn.execute(
      `
      SELECT r.*, u.name AS author_name
      FROM group_post_responses r
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.post_id = ?
      ORDER BY r.created_at ASC
      `,
      [postId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}

/* ================= ADD RESPONSE ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId, userId, message } = body;

    if (!postId || !userId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await conn.execute(
      `
      INSERT INTO group_post_responses (post_id, user_id, message, created_at)
      VALUES (?, ?, ?, NOW())
      `,
      [postId, userId, message]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add response" },
      { status: 500 }
    );
  }
}

/* ================= DELETE RESPONSE ================= */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const responseId = Number(searchParams.get("responseId"));

    if (!responseId) {
      return NextResponse.json(
        { error: "responseId required" },
        { status: 400 }
      );
    }

    await conn.execute(
      `DELETE FROM group_post_responses WHERE id = ?`,
      [responseId]
    );

    return NextResponse.json({
      message: "Response deleted successfully",
    });
  } catch (error) {
    console.error("Delete response error:", error);
    return NextResponse.json(
      { error: "Failed to delete response" },
      { status: 500 }
    );
  }
}
