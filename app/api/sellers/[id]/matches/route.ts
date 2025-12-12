// app/api/sellers/[id]/matches/route.ts
import { NextResponse } from "next/server";
import * as MatchService from "@/server/service/matchService";

async function resolveParams(context: any) {
  try { return await context.params; } catch { return context.params; }
}

export async function GET(req: Request, context: any) {
  const params = await resolveParams(context);
  const sellerId = Number(params?.id || 0);
  const url = new URL(req.url);
  const tenantId = Number(url.searchParams.get("tenantId") || 0);

  if (!sellerId || !tenantId) return NextResponse.json({ success: false, error: "missing sellerId or tenantId" }, { status: 400 });

  try {
    const matches = await MatchService.findBuyersForSeller(tenantId, sellerId, 50);
    return NextResponse.json({ success: true, matches });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 });
  }
}
