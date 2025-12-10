import { conn } from "@/lib/db";

export interface BuyerInput {
  tenantId: number;
  name: string;
  phone?: string;
  email?: string;
  requirement?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
}

export async function createBuyer(input: BuyerInput) {
  const {
    tenantId,
    name,
    phone,
    email,
    requirement,
    budgetMin,
    budgetMax,
    location,
  } = input;

  const [insertResult]: any = await conn.query(
    `INSERT INTO buyers 
     (tenant_id, name, phone, email, requirement, budget_min, budget_max, location)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [tenantId, name, phone, email, requirement, budgetMin, budgetMax, location]
  );

  return insertResult.insertId;
}

export async function getBuyersForTenant(tenantId: number) {
  const [rows]: any = await conn.query(
    "SELECT * FROM buyers WHERE tenant_id = ? ORDER BY id DESC",
    [tenantId]
  );

  return rows;
}

export async function deleteBuyer(id: number, tenantId: number) {
  // Tenant check ensures no cross-access
  const [res]: any = await conn.query(
    "DELETE FROM buyers WHERE id = ? AND tenant_id = ?",
    [id, tenantId]
  );

  return res.affectedRows > 0;
}
