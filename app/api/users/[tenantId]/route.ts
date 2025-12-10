// app/api/users/[tenantId]/route.ts
import { NextResponse } from "next/server";
import { getUsersForTenant } from "@/server/service/userService";

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

  try {
    const users = await getUsersForTenant(idNum);
    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
