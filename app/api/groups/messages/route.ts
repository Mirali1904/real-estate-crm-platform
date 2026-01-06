import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const groupId = Number(searchParams.get("groupId"));
    const tenantId = Number(searchParams.get("tenantId"));

    if (!groupId || !tenantId) {
      return NextResponse.json({ messages: [] });
    }

    // 🔐 permission check: tenant must be in group_agencies
    const [memberRows]: any = await conn.query(
      `
      SELECT 1
      FROM group_agencies
      WHERE group_id = ? AND tenant_id = ? AND status = 'active'
      `,
      [groupId, tenantId]
    );

    if (memberRows.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    // 📥 fetch messages
    const [rows]: any = await conn.query(
      `
      SELECT
        gm.id,
        gm.message,
        gm.created_at,
        u.name AS sender_name,
        gm.sender_tenant_id
      FROM group_messages gm
      JOIN users u ON u.id = gm.sender_user_id
      WHERE gm.group_id = ?
      ORDER BY gm.created_at ASC
      `,
      [groupId]
    );

    return NextResponse.json({ messages: rows });
  } catch (error) {
    console.error("GET /api/groups/messages error:", error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      groupId,
      tenantId,
      userId,
      message,
    } = body;

    if (!groupId || !tenantId || !userId || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    // 🔐 permission check: tenant must be active member of group
    const [memberRows]: any = await conn.query(
      `
      SELECT 1
      FROM group_agencies
      WHERE group_id = ? AND tenant_id = ? AND status = 'active'
      `,
      [groupId, tenantId]
    );

    if (memberRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Not allowed" },
        { status: 403 }
      );
    }

    // 📝 insert message
    await conn.query(
      `
      INSERT INTO group_messages
        (group_id, sender_tenant_id, sender_user_id, message)
      VALUES (?, ?, ?, ?)
      `,
      [groupId, tenantId, userId, message]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/groups/messages error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}