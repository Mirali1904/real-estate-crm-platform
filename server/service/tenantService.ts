// server/service/tenantService.ts
import { conn } from "@/lib/db";

export interface Tenant {
  id: number;
  name: string;
  created_at: Date | string;
}

export async function getTenantById(id: number): Promise<Tenant | null> {
  const [rows]: any = await conn.query(
    "SELECT * FROM tenants WHERE id = ?",
    [id]
  );

  if (rows.length === 0) return null;
  return rows[0] as Tenant;
}
