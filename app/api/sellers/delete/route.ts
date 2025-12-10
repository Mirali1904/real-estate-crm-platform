import { NextResponse } from "next/server";
import { deleteSeller } from "@/server/service/sellerService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, tenantId } = body;

    if (!id || !tenantId) {
      return NextResponse.json(
        { success: false, message: "id and tenantId are required" },
        { status: 400 }
      );
    }

    await deleteSeller(Number(id), Number(tenantId));

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
