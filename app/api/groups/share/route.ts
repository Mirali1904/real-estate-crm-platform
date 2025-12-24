import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      entityType,   // "buyer" | "seller"
      entityId,
      groupIds,
      userId,
      agencyId
    } = body;

    /* ================= VALIDATION ================= */

    if (
      !entityType ||
      !entityId ||
      !Array.isArray(groupIds) ||
      groupIds.length === 0 ||
      !userId ||
      !agencyId
    ) {
      console.error("❌ SHARE VALIDATION FAILED", body);
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* ================= GET TENANT FROM USER ================= */

    const [[user]]: any = await conn.execute(
      `
      SELECT tenant_id
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 400 }
      );
    }

    const tenantId = user.tenant_id;

    /* ================= CORE LOGIC ================= */

    for (const groupId of groupIds) {

      /* ---------- STEP 1: Ensure agency(user) is group member ---------- */
      const [existingAgency]: any = await conn.execute(
        `
        SELECT id
        FROM group_agencies
        WHERE group_id = ?
          AND agency_id = ?
          AND status = 'active'
        `,
        [groupId, agencyId]
      );

      if (existingAgency.length === 0) {
        await conn.execute(
          `
          INSERT INTO group_agencies
            (group_id, agency_id, tenant_id, status)
          VALUES (?, ?, ?, 'active')
          `,
          [groupId, agencyId, tenantId]
        );
      }

      /* ---------- STEP 2: Create group post (THIS IS THE SHARE) ---------- */
      await conn.execute(
        `
        INSERT INTO group_posts
          (
            group_id,
            user_id,
            tenant_id,
            post_type,
            title,
            description,
            status
          )
        VALUES (?, ?, ?, ?, ?, ?, 'active')
        `,
        [
          groupId,
          userId,
          tenantId,
          entityType, // buyer | seller
          `${entityType.toUpperCase()} SHARED`,
          `${entityType} id: ${entityId}`
        ]
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ SHARE ERROR", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
