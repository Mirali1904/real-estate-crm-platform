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
    `
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.created_at,

      -- 🔹 PROPERTIES COUNT
      CASE
        WHEN u.role = 'ADMIN' THEN (
          SELECT COUNT(*)
          FROM sellers s
          WHERE s.tenant_id = u.tenant_id
        )
        ELSE (
          SELECT COUNT(*)
          FROM sellers s
          WHERE s.agent_id = u.id
            AND s.tenant_id = u.tenant_id
        )
      END AS properties_count,

      -- 🔹 SALES AMOUNT
      CASE
        WHEN u.role = 'ADMIN' THEN (
          SELECT COALESCE(SUM(price), 0)
          FROM sellers s
          WHERE s.tenant_id = u.tenant_id
        )
        ELSE (
          SELECT COALESCE(SUM(price), 0)
          FROM sellers s
          WHERE s.agent_id = u.id
            AND s.tenant_id = u.tenant_id
        )
      END AS sales_amount

    FROM users u
    WHERE u.tenant_id = ?
    ORDER BY u.created_at DESC
    `,
    [tenantId]
  );

  return rows;
}

