import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/* =========================
   GET GROUP AGENCIES
========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = Number(searchParams.get("groupId"));

    if (!groupId) {
      return NextResponse.json([], { status: 200 });
    }

    const [rows]: any = await conn.execute(
      `
      SELECT
        ga.id,
        ga.tenant_id AS user_id,
        u.name,
        u.email
      FROM group_agencies ga
      INNER JOIN users u
        ON u.tenant_id = ga.tenant_id
       AND u.role = 'ADMIN'
      WHERE ga.group_id = ?
        AND ga.status = 'active'
      ORDER BY u.name ASC
      `,
      [groupId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch group agencies error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

/* =========================
   ADD AGENCY
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { groupId, userId } = body; // userId == tenant_id

    if (!groupId || !userId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 🔁 if already exists → activate
    const [exists]: any = await conn.execute(
      `
      SELECT id FROM group_agencies
      WHERE group_id = ? AND tenant_id = ?
      `,
      [groupId, userId]
    );

    if (exists.length > 0) {
      await conn.execute(
        `
        UPDATE group_agencies
        SET status = 'active'
        WHERE group_id = ? AND tenant_id = ?
        `,
        [groupId, userId]
      );
    } else {
      await conn.execute(
        `
        INSERT INTO group_agencies
          (group_id, tenant_id, status, joined_at)
        VALUES (?, ?, 'active', NOW())
        `,
        [groupId, userId]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add agency error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

/* =========================
   REMOVE AGENCY
========================= */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = Number(searchParams.get("groupId"));
    const userId = Number(searchParams.get("userId")); // tenant_id

    if (!groupId || !userId) {
      return NextResponse.json({ error: "Missing" }, { status: 400 });
    }

    await conn.execute(
      `
      UPDATE group_agencies
      SET status = 'inactive'
      WHERE group_id = ? AND tenant_id = ?
      `,
      [groupId, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove agency error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
