import { NextRequest, NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const groupId = searchParams.get("groupId");
    const tenantId = searchParams.get("tenantId");

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId required" },
        { status: 400 }
      );
    }

    // ✅ Fetch ALL messages from this group (not just current tenant)
    const [rows] = await conn.query(
      `
      SELECT
        id,
        group_id,
        sender_tenant_id,
        sender_user_id,
        sender_name,
        message,
        created_at
      FROM group_messages
      WHERE group_id = ?
      ORDER BY created_at ASC
      `,
      [groupId] // ✅ Only filter by groupId, not tenantId
    );

    return NextResponse.json({
      success: true,
      messages: rows,
    });
  } catch (err) {
    console.error("GET messages error:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - save new group message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      groupId,
      tenantId,
      userId,
      sender_name,
      message,
    } = body;

    if (!groupId || !tenantId || !userId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [result]: any = await conn.query(
      `
      INSERT INTO group_messages
        (group_id, sender_tenant_id, sender_user_id, sender_name, message, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      `,
      [
        groupId,
        tenantId,
        userId,
        sender_name || "Unknown",
        message,
      ]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error("POST message error:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}