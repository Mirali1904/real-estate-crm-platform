// app/api/users/create/route.ts
import { NextResponse } from "next/server";
import { createUserForTenant } from "@/server/service/userService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, name, email, password, role } = body;

    // simple validation
    if (!tenantId || !name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      const result = await createUserForTenant({
        tenantId,
        name,
        email,
        password,
        role,
      });

      return NextResponse.json(
        {
          success: true,
          message: "User created successfully",
          userId: result.userId,
        },
        { status: 201 }
      );
    } catch (err: any) {
      if (err.message === "EMAIL_EXISTS") {
        return NextResponse.json(
          { success: false, message: "Email already exists" },
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
