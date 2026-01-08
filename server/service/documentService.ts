// server/services/documentService.ts
import { conn } from "@/lib/db";

export const documentService = {
  async addDocument(data: {
    tenant_id: number;
    entity_type: "buyer" | "seller";
    entity_id: number;
    file_name: string;
    file_path: string;
    uploaded_by?: number;
  }) {
    const {
      tenant_id,
      entity_type,
      entity_id,
      file_name,
      file_path,
      uploaded_by,
    } = data;

    await conn.query(
      `
      INSERT INTO documents
      (tenant_id, entity_type, entity_id, file_name, file_path, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        tenant_id,
        entity_type,
        entity_id,
        file_name,
        file_path,
        uploaded_by ?? null,
      ]
    );
  },

  async getDocuments(entity_type: "buyer" | "seller", entity_id: number) {
    const [rows] = await conn.query(
      `
      SELECT id, file_name, file_path, created_at
      FROM documents
      WHERE entity_type = ? AND entity_id = ?
      ORDER BY created_at DESC
      `,
      [entity_type, entity_id]
    );

    return rows;
  },    

   getById(id: number) {
    return conn
      .query("SELECT * FROM documents WHERE id = ?", [id])
      .then(([rows]: any) => rows[0]);
  },

  deleteDocument(id: number) {
    return conn.query("DELETE FROM documents WHERE id = ?", [id]);
  },
};
