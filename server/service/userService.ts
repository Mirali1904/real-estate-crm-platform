// server/service/userService.ts
import { conn } from "@/lib/db";
import bcrypt from "bcryptjs";

export interface CreateUserInput {
  tenantId: number; // will be mapped to tenant_id
  name: string;
  email: string;
  password: string;
  role?: string; // default AGENT
}

// create extra user under an existing tenant
export async function createUserForTenant(input: CreateUserInput) {
  const { tenantId, name, email, password, role = "AGENT" } = input;

  // 1) Check if email already exists in users table
  const [existing]: any = await conn.query(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    throw new Error("EMAIL_EXISTS");
  }

  // 2) Hash password
  const hashed = await bcrypt.hash(password, 10);

  // 3) Insert user row (NO tenants insert here)
  const [result]: any = await conn.query(
    "INSERT INTO users (tenant_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
    [tenantId, name, email, hashed, role]
  );

  return {
    userId: result.insertId,
  };
}

// get all users for a specific tenant (agency)
export async function getUsersForTenant(tenantId: number) {
  const [rows]: any = await conn.query(
    "SELECT id, name, email, role, created_at FROM users WHERE tenant_id = ? ORDER BY id ASC",
    [tenantId]
  );

  return rows;
}
