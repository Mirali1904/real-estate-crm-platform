// server/service/sellerService.ts
import { conn } from "@/lib/db";

export interface CreateSellerInput {
  tenantId: number;
  name: string;
  phone: string;
  email?: string;
  propertyType?: string;
  location?: string;
  price?: number;
}

// create seller / property for a tenant
export async function createSeller(input: CreateSellerInput) {
  const { tenantId, name, phone, email, propertyType, location, price } = input;

  const [result]: any = await conn.query(
    `INSERT INTO sellers (tenant_id, name, phone, email, property_type, location, price)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tenantId, name, phone, email || null, propertyType || null, location || null, price ?? null]
  );

  return result.insertId as number;
}

// get sellers for a tenant
export async function getSellersByTenant(tenantId: number) {
  const [rows]: any = await conn.query(
    "SELECT * FROM sellers WHERE tenant_id = ? ORDER BY id DESC",
    [tenantId]
  );
  return rows;
}

// delete seller (only inside its tenant)
export async function deleteSeller(id: number, tenantId: number) {
  await conn.query("DELETE FROM sellers WHERE id = ? AND tenant_id = ?", [
    id,
    tenantId,
  ]);
}
