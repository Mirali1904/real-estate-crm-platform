import { NextResponse } from "next/server";
import { followUpService } from "@/server/service/followUpService";

/**
 * GET AGENT FOLLOW-UPS
 * GET /api/follow-ups/agent?agentId=18&tenantId=10&filter=today
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    

    const agentId = Number(searchParams.get("agentId"));
    const tenantId = Number(searchParams.get("tenantId"));
    
    const filter = searchParams.get("filter") as
  | "today"
  | "overdue"
  | null;


    if (!agentId || !tenantId) {
      return NextResponse.json(
        { message: "agentId and tenantId are required" },
        { status: 400 }
      );
    }

    // 🔹 base data
  let followUps = await followUpService.getAgentFollowUps(
  agentId,
  tenantId,
  filter || undefined
);


    // 🔹 FILTER LOGIC (SAFE, UI FRIENDLY)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === "today") {
      followUps = followUps.filter((fu: any) => {
        const d = new Date(fu.follow_up_date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
    }

    if (filter === "overdue") {
      followUps = followUps.filter((fu: any) => {
        const d = new Date(fu.follow_up_date);
        d.setHours(0, 0, 0, 0);
        return d < today && fu.status === "PENDING";
      });
    }

    // 🔥 NORMALIZE DATA FOR UI (DO NOT REMOVE)
    const normalized = followUps.map((fu: any) => ({
      ...fu,
      entity_type: fu.buyer_id ? "Buyer" : "Seller",
      entity_name: fu.buyer_name || fu.seller_name || null,
    }));

    return NextResponse.json(
      { data: normalized },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET FOLLOW-UPS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
