import { NextResponse } from "next/server";
import { GroupService } from "@/server/service/group.service";

const groupService = new GroupService();

// GET /api/groups/available-agents - Get agents not in group
export async function GET(req: Request) {
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

    const agents = await groupService.getAvailableAgents(groupId, tenantId);
    return NextResponse.json(agents);
  } catch (error: any) {
    console.error("Error fetching available agents:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch available agents" },
      { status: 500 }
    );
  }
}