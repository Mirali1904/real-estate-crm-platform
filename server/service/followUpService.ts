import { PoolConnection } from "mysql2/promise";
import { conn } from "@/lib/db";

/**
 * Follow-up Service
 */
export const followUpService = {
  /**
   * CREATE FOLLOW-UP
   */
  async create(data: {
    tenantId: number;
    buyerId: number;
    sellerId?: number;
    agentId: number;
    followUpType: "CALL" | "WHATSAPP" | "VISIT" | "EMAIL";
    followUpDate: string;
    followUpTime?: string;
    note?: string;
  }) {
    const {
      tenantId,
      buyerId,
      sellerId,
      agentId,
      followUpType,
      followUpDate,
      followUpTime,
      note,
    } = data;

    const sql = `
      INSERT INTO follow_ups
      (tenant_id, buyer_id, seller_id, agent_id, follow_up_type, follow_up_date, follow_up_time, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      tenantId,
      buyerId,
      sellerId || null,
      agentId,
      followUpType,
      followUpDate,
      followUpTime || null,
      note || null,
    ];

    const [result] = await conn.execute(sql, params);
    return result;
  },

  /**
   * GET FOLLOW-UPS FOR AGENT (Today / Pending)
   */
  /**
 * GET FOLLOW-UPS FOR AGENT (Pending)
 */
async getAgentFollowUps(
  agentId: number,
  tenantId: number,
  filter?: "today" | "overdue"
) {


    let filterSql = "";

if (filter === "today") {
  filterSql = "AND DATE(fu.follow_up_date) = CURDATE()";
}

if (filter === "overdue") {
  filterSql = "AND fu.follow_up_date < CURDATE()";
}


  const sql = `
  SELECT fu.*, b.name AS buyer_name, s.name AS seller_name
  FROM follow_ups fu
  LEFT JOIN buyers b ON b.id = fu.buyer_id
  LEFT JOIN sellers s ON s.id = fu.seller_id
  WHERE fu.agent_id = ?
    AND fu.tenant_id = ?
    AND fu.status = 'PENDING'
    ${filterSql}
  ORDER BY fu.follow_up_date ASC
`;


  const [rows] = await conn.execute(sql, [agentId, tenantId]);

  return rows as any[];
},

  /**
   * UPDATE FOLLOW-UP STATUS
   */
  async updateStatus(
    followUpId: number,
    status: "DONE" | "NO_RESPONSE" | "NOT_INTERESTED",
    note?: string
  ) {
    const sql = `
      UPDATE follow_ups
      SET status = ?, note = ?
      WHERE id = ?
    `;

    const [result] = await conn.execute(sql, [
      status,
      note || null,
      followUpId,
    ]);

    return result;
  },
};
