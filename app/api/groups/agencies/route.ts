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
        ga.tenant_id,
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
   ADD AGENCY (TENANT BASED)
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { groupId, tenantId } = body;

    if (!groupId || !tenantId) {
      return NextResponse.json(
        { error: "groupId and tenantId required" },
        { status: 400 }
      );
    }

    /* 🔍 CHECK GROUP OWNER TENANT */
    const [[group]]: any = await conn.execute(
      `
      SELECT tenant_id
      FROM groups
      WHERE id = ?
      `,
      [groupId]
    );

    if (!group) {
      return NextResponse.json({ error: "Invalid group" }, { status: 400 });
    }

    /* 🚫 OWNER ALREADY EXISTS */
    if (group.tenant_id === tenantId) {
      return NextResponse.json({ success: true });
    }

    /* 🔁 CHECK EXISTING */
    const [exists]: any = await conn.execute(
      `
      SELECT id FROM group_agencies
      WHERE group_id = ? AND tenant_id = ?
      `,
      [groupId, tenantId]
    );

    if (exists.length > 0) {
      await conn.execute(
        `
        UPDATE group_agencies
        SET status = 'active'
        WHERE group_id = ? AND tenant_id = ?
        `,
        [groupId, tenantId]
      );
    } else {
      await conn.execute(
        `
        INSERT INTO group_agencies
          (group_id, tenant_id, status, joined_at)
        VALUES (?, ?, 'active', NOW())
        `,
        [groupId, tenantId]
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
    const tenantId = Number(searchParams.get("tenantId"));

    if (!groupId || !tenantId) {
      return NextResponse.json(
        { error: "groupId and tenantId required" },
        { status: 400 }
      );
    }

    await conn.execute(
      `
      UPDATE group_agencies
      SET status = 'inactive'
      WHERE group_id = ? AND tenant_id = ?
      `,
      [groupId, tenantId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove agency error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
