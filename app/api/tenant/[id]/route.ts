import { NextResponse } from "next/server";
import { getTenantById } from "@/server/service/tenantService";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }   // 👈 params is a Promise now
) {
  // ✅ unwrap the Promise
  const { id } = await ctx.params;

  const tenantId = Number(id);
  if (Number.isNaN(tenantId)) {
    return NextResponse.json(
      { message: "Invalid tenant id" },
      { status: 400 }
    );
  }

  try {
    const tenant = await getTenantById(tenantId);

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tenant }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
