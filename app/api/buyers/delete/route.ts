import { NextResponse } from "next/server";
import { deleteBuyer } from "@/server/service/buyerService";

export async function POST(req: Request) {
  try {
    const { id, tenantId } = await req.json();

    const deleted = await deleteBuyer(id, tenantId);

    return NextResponse.json({
      message: deleted ? "Deleted" : "Not found",
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
