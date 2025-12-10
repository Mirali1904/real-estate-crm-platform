import { NextResponse } from "next/server";
import { getBuyersForTenant } from "@/server/service/buyerService";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await ctx.params;

  const idNumber = Number(tenantId);

  if (isNaN(idNumber))
    return NextResponse.json(
      { message: "Invalid tenant" },
      { status: 400 }
    );

  const data = await getBuyersForTenant(idNumber);

  return NextResponse.json({ buyers: data });
}
