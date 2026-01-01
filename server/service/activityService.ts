import { conn } from "@/lib/db";

type AgentActivityPayload = {
  tenantId: number;
  agentId: number;
  actionType: string;

  entityType?: "buyer" | "seller";
  entityId?: number;

  description?: string;
};

/**
 * Logs agent activity into agent_activity_logs table
 * This is an append-only log (NO updates, NO deletes)
 */
export async function logAgentActivity(
  payload: AgentActivityPayload
) {
  const {
    tenantId,
    agentId,
    actionType,
    entityType = null,
    entityId = null,
    description = null,
  } = payload;

  if (!tenantId || !agentId || !actionType) {
    // silently ignore invalid logs
    return;
  }

  try {
    await conn.execute(
      `
      INSERT INTO agent_activity_logs
        (tenant_id, agent_id, action_type, entity_type, entity_id, description)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        tenantId,
        agentId,
        actionType,
        entityType,
        entityId,
        description,
      ]
    );
  } catch (err) {
    // ⚠️ Activity log failure should NEVER break main flow
    console.error("Agent activity log failed:", err);
  }
}
