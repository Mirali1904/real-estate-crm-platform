import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Get permissions for a specific role
export async function GET(
  request: Request,
  { params }: { params: { roleId: string } }
) {
  try {
    const [permissions] = await pool.query(
      `SELECT p.* FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [params.roleId]
    );
    
    return NextResponse.json({ success: true, permissions });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch role permissions" },
      { status: 500 }
    );
  }
}

// Update permissions for a role
export async function POST(
  request: Request,
  { params }: { params: { roleId: string } }
) {
  try {
    const { permissionIds } = await request.json();
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete existing permissions
      await connection.query(
        "DELETE FROM role_permissions WHERE role_id = ?",
        [params.roleId]
      );
      
      // Insert new permissions
      if (permissionIds && permissionIds.length > 0) {
        const values = permissionIds.map((pid: number) => [params.roleId, pid]);
        await connection.query(
          "INSERT INTO role_permissions (role_id, permission_id) VALUES ?",
          [values]
        );
      }
      
      await connection.commit();
      return NextResponse.json({ success: true });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update permissions" },
      { status: 500 }
    );
  }
}