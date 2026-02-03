import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId, permissionName } = await request.json();
    
    const [result]: any = await pool.query(
      `SELECT COUNT(*) as has_permission
       FROM users u
       INNER JOIN roles r ON u.role = r.name
       INNER JOIN role_permissions rp ON r.id = rp.role_id
       INNER JOIN permissions p ON rp.permission_id = p.id
       WHERE u.id = ? AND p.name = ?`,
      [userId, permissionName]
    );
    
    const hasPermission = result[0].has_permission > 0;
    
    return NextResponse.json({ success: true, hasPermission });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to check permission" },
      { status: 500 }
    );
  }
}