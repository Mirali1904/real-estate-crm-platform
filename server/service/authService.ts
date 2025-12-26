// server/service/authService.ts
import { conn } from "@/lib/db";
import bcrypt from "bcryptjs";

/* ================= TYPES ================= */

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

/* ================= SIGNUP ================= */

// create tenant + admin user (SAFE + NO NULL TENANT)
export async function createTenantWithAdmin(input: SignupInput) {
  const { tenantName, name, email, password } = input;

  // 🔒 VALIDATION (VERY IMPORTANT)
  if (!tenantName || !name || !email || !password) {
    throw new Error("MISSING_FIELDS");
  }

  const connection = await conn.getConnection();

  try {
    // 🔒 START TRANSACTION
    await connection.beginTransaction();

    // 1️⃣ Check if email already exists
    const [existing]: any = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      throw new Error("EMAIL_EXISTS");
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create tenant (NAME WILL NEVER BE NULL)
    const [tenantResult]: any = await connection.query(
      "INSERT INTO tenants (name) VALUES (?)",
      [tenantName.trim()]
    );

    const tenantId = tenantResult.insertId;

    // 4️⃣ Create ADMIN user
    const [userResult]: any = await connection.query(
      `
      INSERT INTO users (tenant_id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
      `,
      [tenantId, name.trim(), email.trim(), hashedPassword, "ADMIN"]
    );

    // ✅ COMMIT TRANSACTION
    await connection.commit();

    return {
      tenantId,
      userId: userResult.insertId,
    };
  } catch (error) {
    // ❌ ROLLBACK ON ANY ERROR
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/* ================= LOGIN HELPERS ================= */

// get user by email
export async function getUserByEmail(email: string): Promise<UserData | null> {
  const [rows]: any = await conn.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0) return null;
  return rows[0] as UserData;
}

// verify password
export async function verifyPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
