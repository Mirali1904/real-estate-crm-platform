// server/service/authService.ts
import { conn } from "@/lib/db";
import bcrypt from 'bcryptjs';
export interface SignupInput {
  tenantName: string;
  name: string;
  email: string;
  password: string;
}

export interface UserData {
  id: number;
  tenant_id: number;
  name: string;
  email: string;
  role: string;
  password: string;
}

// create tenant + admin user
export async function createTenantWithAdmin(input: SignupInput) {
  const { tenantName, name, email, password } = input;

  // check if email already exists
  const [existing]: any = await conn.query(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    throw new Error("EMAIL_EXISTS");
  }

  const hashed = await bcrypt.hash(password, 10);

  // create tenant
  const [tenantResult]: any = await conn.query(
    "INSERT INTO tenants (name) VALUES (?)",
    [tenantName]
  );
  const tenantId = tenantResult.insertId;

  // create user
  const [userResult]: any = await conn.query(
    "INSERT INTO users (tenant_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
    [tenantId, name, email, hashed, "ADMIN"]
  );

  return {
    tenantId,
    userId: userResult.insertId,
  };
}

// get user by email (for login)
export async function getUserByEmail(email: string): Promise<UserData | null> {
  const [rows]: any = await conn.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0) return null;
  return rows[0] as UserData;
}

// verify password for login
export async function verifyPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
