import { NextResponse } from "next/server";
import { conn } from "@/lib/db";
import { ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";


export async function PUT(req: Request) {
  try {
    const { userId, tenantId, name, email, password, role } = await req.json();

    if (!userId || !tenantId || !name || !email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Check if email already exists (excluding current user)
    const [existing]: any = await conn.query(
      `SELECT id FROM users WHERE email = ? AND id != ? AND tenant_id = ?`,
      [email, userId, tenantId]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    // ✅ Build update query
    let query = `UPDATE users SET name = ?, email = ?, role = ?`;
    let params: any[] = [name, email, role];

    // ✅ If password provided, hash and update it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      params.push(hashedPassword);
    }

    query += ` WHERE id = ? AND tenant_id = ?`;
    params.push(userId, tenantId);

    const [result] = await conn.query<ResultSetHeader>(query, params);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}