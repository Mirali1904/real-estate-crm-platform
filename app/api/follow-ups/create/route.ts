import { NextResponse } from "next/server";
import { followUpService } from "@/server/service/followUpService";

/**
 * CREATE FOLLOW-UP
 * POST /api/follow-ups/create
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      tenantId,
      buyerId = null,
      sellerId = null,
      agentId,
      followUpType,
      followUpDate,
      note,
    } = body;

    // 🔒 Validation
    if (!tenantId || !agentId || !followUpDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!buyerId && !sellerId) {
      return NextResponse.json(
        { error: "Either buyerId or sellerId is required" },
        { status: 400 }
      );
    }

    const result = await followUpService.create({
      tenantId,
      buyerId,
      sellerId,
      agentId,
      followUpType,
      followUpDate,
      note,
    });

    return NextResponse.json(
      { message: "Follow-up created successfully", result },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE FOLLOW-UP ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
