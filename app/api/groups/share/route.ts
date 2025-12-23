import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { entityType, entityId, groupIds, tenantId, userId } = body;

    // ✅ Validation
    if (
      !entityType ||
      !entityId ||
      !Array.isArray(groupIds) ||
      groupIds.length === 0 ||
      !tenantId ||
      !userId
    ) {
      console.error("❌ SHARE VALIDATION FAILED", body);
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    for (const groupId of groupIds) {
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
          entityType,                       // buyer | seller
          `${entityType.toUpperCase()} SHARE`,
          `${entityType} id: ${entityId}`, // 👈 buyerId / sellerId here
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("share error", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
