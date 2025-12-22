import { conn } from "@/lib/db";

export interface CreateSellerInput {
  tenantId: number;
  name?: string;          // seller name
  phone?: string;         // owner contact
  email?: string;
  propertyType?: string;
  location?: string;
  price?: number;
}

// ================================
// CREATE SELLER / PROPERTY
// ================================
export async function createSeller(input: CreateSellerInput) {
  const {
    tenantId,
    name,
    phone,
    email,
    propertyType,
    location,
    price,
  } = input;

  // ✅ GUARANTEE: name will NEVER be null
  const finalName =
    name?.trim() ||
    email?.split("@")[0] ||
    "Unknown Seller";

  const [result]: any = await conn.query(
    `
    INSERT INTO sellers (
      tenant_id,
      name,
      owner_contact,
      email,
      property_type,
      location,
      price,
      status,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'LISTED', NOW())
    `,
    [
      tenantId,
      finalName,              // ✅ FIX: name is saved here
      phone || null,
      email || null,
      propertyType || null,
      location || null,
      price ?? null,
    ]
  );

  return result.insertId as number;
}

// ================================
// GET SELLERS BY TENANT
// ================================
export async function getSellersByTenant(tenantId: number) {
  const [rows]: any = await conn.query(
    "SELECT * FROM sellers WHERE tenant_id = ? ORDER BY id DESC",
    [tenantId]
  );
  return rows;
}

// ================================
// DELETE SELLER
// ================================
export async function deleteSeller(id: number, tenantId: number) {
  await conn.query(
    "DELETE FROM sellers WHERE id = ? AND tenant_id = ?",
    [id, tenantId]
  );
}
