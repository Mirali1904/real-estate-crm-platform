import { NextResponse } from "next/server";
import { conn } from "@/lib/db";
import { ResultSetHeader } from "mysql2";

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID required" },
        { status: 400 }
      );
    }

    const [result] = await conn.query<ResultSetHeader>(
      `DELETE FROM users WHERE id = ?`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    );
  }
}