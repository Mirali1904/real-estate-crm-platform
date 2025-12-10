import { NextResponse } from "next/server";
import { createBuyer } from "@/server/service/buyerService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const buyerId = await createBuyer(body);

    return NextResponse.json(
      { message: "Buyer created", buyerId },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
