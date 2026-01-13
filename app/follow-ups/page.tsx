"use client";

import { useEffect, useState } from "react";
import AgentFollowUpList from "@/components/follow-ups/AgentFollowUpList";
import BackButton from "@/components/BackButton";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function FollowUpsPage() {
  const [agentId, setAgentId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    setAgentId(user.id);
    setTenantId(user.tenant_id ?? user.tenantId);
  }, []);

  /* 🔹 LOADING STATE */
  if (!agentId || !tenantId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Header />
        <main className="ml-52 pt-16 px-6 text-sm text-gray-400">
          Loading follow-ups...
        </main>
      </div>
    );
  }

  /* 🔹 FINAL RETURN — THIS WAS MISSING ❗ */
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />

      <main className="ml-52 pt-16 px-6 space-y-6">
        <BackButton />

        <div>
          <h1 className="text-2xl font-semibold">Follow-ups</h1>
          <p className="text-sm text-gray-500 mt-1">
            All pending and completed follow-ups assigned to you
          </p>
        </div>

        <AgentFollowUpList
          agentId={agentId}
          tenantId={tenantId}
        />
      </main>
    </div>
  );
}
