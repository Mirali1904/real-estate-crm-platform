import { NextResponse } from "next/server";
import { createSeller } from "@/server/service/sellerService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, name, phone, email, propertyType, location, price } = body;

    if (!tenantId || !name || !phone) {
      return NextResponse.json(
        { success: false, message: "tenantId, name and phone are required" },
        { status: 400 }
      );
    }

    const sellerId = await createSeller({
      tenantId: Number(tenantId),
      name,
      phone,
      email,
      propertyType,
      location,
      price: price ? Number(price) : undefined,
    });

    return NextResponse.json(
      { success: true, sellerId },
      { status: 201 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
