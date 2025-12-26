import { NextResponse } from "next/server";
import { createTenantWithAdmin } from "@/server/service/authService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await createTenantWithAdmin(body);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        data: result,
      },
      { status: 201 }
    );
  } catch (err: any) {
    // Email already exists
    if (err.message === "EMAIL_EXISTS") {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    // Required fields missing
    if (err.message === "MISSING_FIELDS") {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Any unexpected error
    return NextResponse.json(
      { success: false, message: "Unable to create account" },
      { status: 500 }
    );
  }
}
