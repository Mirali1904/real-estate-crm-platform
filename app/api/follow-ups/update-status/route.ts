import { NextResponse } from "next/server";
import { followUpService } from "@/server/service/followUpService";

/**
 * UPDATE FOLLOW-UP STATUS
 * PATCH /api/follow-ups/update-status
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { followUpId, status, note } = body;

    // 🔒 Validation
    if (!followUpId || !status) {
      return NextResponse.json(
        { message: "followUpId and status are required" },
        { status: 400 }
      );
    }

    const allowedStatuses = ["DONE", "NO_RESPONSE", "NOT_INTERESTED"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }

    const result = await followUpService.updateStatus(
      followUpId,
      status,
      note
    );

    return NextResponse.json(
      { message: "Follow-up status updated", result },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE FOLLOW-UP STATUS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
