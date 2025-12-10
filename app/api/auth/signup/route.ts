import { NextResponse } from "next/server";
import { createTenantWithAdmin } from "@/server/service/authService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await createTenantWithAdmin(body);

    return NextResponse.json(
      { success: true, message: "Account created", data: result },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.message === "EMAIL_EXISTS") {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
