import { NextResponse } from "next/server";
import { conn } from "@/lib/db";

/**
 * BODY EXPECTED
 * {
 *   buyerId: number,
 *   tenantId: number,
 *   agentId: number,
 *   transferredBy: number,
 *   transferReason?: string
 * }
 */

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      buyerId,
      tenantId,
      agentId,
      transferredBy,
      transferReason,
    } = body;

    if (!buyerId || !tenantId || !agentId || !transferredBy) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    /* 🔹 1. Get current agent (if any) */
    const [rows]: any = await conn.execute(
      `
      SELECT agent_id
      FROM buyers
      WHERE id = ? AND tenant_id = ?
      `,
      [buyerId, tenantId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Buyer not found" },
        { status: 404 }
      );
    }

    const previousAgentId = rows[0].agent_id;

    /* 🔹 2. Update buyer owner */
    await conn.execute(
      `
      UPDATE buyers
      SET agent_id = ?, assigned_at = NOW()
      WHERE id = ? AND tenant_id = ?
      `,
      [agentId, buyerId, tenantId]
    );

    /* 🔹 3. If reassigned, save transfer history */
    if (previousAgentId && previousAgentId !== agentId) {
      await conn.execute(
        `
        INSERT INTO buyer_lead_transfers
          (buyer_id, tenant_id, from_agent_id, to_agent_id, transfer_reason, transferred_by)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          buyerId,
          tenantId,
          previousAgentId,
          agentId,
          transferReason || "Reassigned",
          transferredBy,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Agent assigned successfully",
    });
  } catch (error) {
    console.error("Assign agent error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
