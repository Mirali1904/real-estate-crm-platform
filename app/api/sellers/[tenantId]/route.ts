import { NextResponse } from "next/server";
import { getSellersByTenant } from "@/server/service/sellerService";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await ctx.params;
  const idNum = Number(tenantId);

  if (Number.isNaN(idNum)) {
    return NextResponse.json(
      { success: false, message: "Invalid tenant id" },
      { status: 400 }
    );
  }

  const sellers = await getSellersByTenant(idNum);
  return NextResponse.json({ success: true, sellers }, { status: 200 });
}
