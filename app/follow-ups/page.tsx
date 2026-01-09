"use client";

import { useEffect, useState } from "react";
import AgentFollowUpList from "@/components/follow-ups/AgentFollowUpList";
import BackButton from "@/components/BackButton";

export default function FollowUpsPage() {
  const [agentId, setAgentId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);

  // ✅ hydration-safe
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    setAgentId(user.id);
    setTenantId(user.tenant_id ?? user.tenantId);
  }, []);

  if (!agentId || !tenantId) {
    return (
      <div className="px-6 pt-6 text-sm text-gray-400">
        Loading follow-ups...
      </div>
    );
  }

  return (
    <div className="px-6 pt-6 space-y-6">
      {/* BACK BUTTON */}
      <BackButton />

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Follow-ups</h1>
        <p className="text-sm text-gray-500 mt-1">
          All pending and completed follow-ups assigned to you
        </p>
      </div>

      {/* LIST */}
      <AgentFollowUpList
        agentId={agentId}
        tenantId={tenantId}
      />
    </div>
  );
}
