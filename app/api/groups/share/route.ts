// app/api/groups/share/route.ts
import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      entityType,
      entityId,
      groupIds,
      userId,
      tenantId,
    } = body;

    if (
      !entityType ||
      !entityId ||
      !Array.isArray(groupIds) ||
      groupIds.length === 0 ||
      !userId ||
      !tenantId
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    for (const groupId of groupIds) {
      /* Ensure tenant is group member */
      const [exists]: any = await conn.execute(
        `
        SELECT id
        FROM group_agencies
        WHERE group_id = ?
          AND tenant_id = ?
          AND status = 'active'
        `,
        [groupId, tenantId]
      );

      if (exists.length === 0) {
        await conn.execute(
          `
          INSERT INTO group_agencies (group_id, tenant_id, status)
          VALUES (?, ?, 'active')
          `,
          [groupId, tenantId]
        );
      }

      let title = "";
      let description = "";

      /* ===== BUYER ===== */
      if (entityType === "buyer") {
        const [[buyer]]: any = await conn.execute(
          `
          SELECT
            name,
            budget_min,
            budget_max,
            location,
            status
          FROM buyers
          WHERE id = ?
            AND tenant_id = ?
          `,
          [entityId, tenantId]
        );

        if (!buyer) continue;

        title = buyer.name;
        description = `Budget: ${buyer.budget_min} - ${buyer.budget_max}
Location: ${buyer.location}
Status: ${buyer.status}`;
      }

      /* ===== SELLER (FIXED) ===== */
      if (entityType === "seller") {
        const [[seller]]: any = await conn.execute(
          `
          SELECT
            name,
            location,
            price
          FROM sellers
          WHERE id = ?
            AND tenant_id = ?
          `,
          [entityId, tenantId]
        );

        if (!seller) continue;

        title = seller.name;
        description = `Location: ${seller.location}
Price: ₹${seller.price}`;
      }

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
    status,
    seller_id
  )
VALUES (?, ?, ?, ?, ?, ?, 'active', ?)

        `,
        [
  groupId,
  userId,
  tenantId,
  entityType,
  title,
  description,
  entityType === "seller" ? entityId : null, // ✅ FINAL FIX
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
