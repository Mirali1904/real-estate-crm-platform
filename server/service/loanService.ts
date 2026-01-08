// server/service/loanService.ts
import { conn } from "@/lib/db";

export const loanService = {
  async createLoan(data: {
    tenant_id: number;
    buyer_id?: number;
    seller_id?: number;
    loan_type: string;
    bank_name?: string;
    loan_amount?: number;
    interest_rate?: number;
    tenure_years?: number;
    remarks?: string;
  }) {
    const {
      tenant_id,
      buyer_id = null,
      seller_id = null,
      loan_type,
      bank_name,
      loan_amount,
      interest_rate,
      tenure_years,
      remarks,
    } = data;

    const [result] = await conn.query(
      `
      INSERT INTO loans
      (tenant_id, buyer_id, seller_id, loan_type, bank_name, loan_amount, interest_rate, tenure_years, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tenant_id,
        buyer_id,
        seller_id,
        loan_type,
        bank_name,
        loan_amount,
        interest_rate,
        tenure_years,
        remarks,
      ]
    );

    return result;
  },

  async getLoansByBuyerId(buyerId: number) {
  const [rows]: any = await conn.query(
    `
    SELECT 
      l.id AS loan_id,
      l.tenant_id,
      l.buyer_id,
      l.seller_id,
      l.loan_type,
      l.bank_name,
      l.loan_amount,
      l.interest_rate,
      l.tenure_years,
      l.status,
      l.remarks,
      l.created_at,

      ld.id AS document_id,
      ld.file_name,
      ld.file_path

    FROM loans l
    LEFT JOIN loan_documents ld ON ld.loan_id = l.id
    WHERE l.buyer_id = ?
    ORDER BY l.created_at DESC
    `,
    [buyerId]
  );

  // 👇 JS grouping (MySQL-safe)
  const loanMap = new Map<number, any>();

  for (const row of rows) {
    if (!loanMap.has(row.loan_id)) {
      loanMap.set(row.loan_id, {
        id: row.loan_id,
        tenant_id: row.tenant_id,
        buyer_id: row.buyer_id,
        seller_id: row.seller_id,
        loan_type: row.loan_type,
        bank_name: row.bank_name,
        loan_amount: row.loan_amount,
        interest_rate: row.interest_rate,
        tenure_years: row.tenure_years,
        status: row.status,
        remarks: row.remarks,
        created_at: row.created_at,
        documents: [],
      });
    }

    if (row.document_id) {
      loanMap.get(row.loan_id).documents.push({
        id: row.document_id,
        file_name: row.file_name,
        file_path: row.file_path,
      });
    }
  }

  return Array.from(loanMap.values());
},



  async getLoansBySellerId(sellerId: number) {
  const [rows]: any = await conn.query(
    `
    SELECT 
      l.id AS loan_id,
      l.tenant_id,
      l.buyer_id,
      l.seller_id,
      l.loan_type,
      l.bank_name,
      l.loan_amount,
      l.interest_rate,
      l.tenure_years,
      l.status,
      l.remarks,
      l.created_at,

      ld.id AS document_id,
      ld.file_name,
      ld.file_path

    FROM loans l
    LEFT JOIN loan_documents ld ON ld.loan_id = l.id
    WHERE l.seller_id = ?
    ORDER BY l.created_at DESC
    `,
    [sellerId]
  );

  const loanMap = new Map<number, any>();

  for (const row of rows) {
    if (!loanMap.has(row.loan_id)) {
      loanMap.set(row.loan_id, {
        id: row.loan_id,
        tenant_id: row.tenant_id,
        buyer_id: row.buyer_id,
        seller_id: row.seller_id,
        loan_type: row.loan_type,
        bank_name: row.bank_name,
        loan_amount: row.loan_amount,
        interest_rate: row.interest_rate,
        tenure_years: row.tenure_years,
        status: row.status,
        remarks: row.remarks,
        created_at: row.created_at,
        documents: [],
      });
    }

    if (row.document_id) {
      loanMap.get(row.loan_id).documents.push({
        id: row.document_id,
        file_name: row.file_name,
        file_path: row.file_path,
      });
    }
  }

  return Array.from(loanMap.values());
},

};
