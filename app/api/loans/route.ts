// app/api/loans/route.ts
import { NextResponse } from "next/server";
import { loanService } from "@/server/service/loanService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const loan = await loanService.createLoan(body);

    return NextResponse.json({ success: true, loan });
  } catch (error) {
    console.error("Loan create error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create loan" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const buyerId = searchParams.get("buyerId");
  const sellerId = searchParams.get("sellerId");

  if (buyerId) {
    const loans = await loanService.getLoansByBuyerId(Number(buyerId));
    return NextResponse.json(loans);
  }

  if (sellerId) {
    const loans = await loanService.getLoansBySellerId(Number(sellerId));
    return NextResponse.json(loans);
  }

  return NextResponse.json([]);
}

