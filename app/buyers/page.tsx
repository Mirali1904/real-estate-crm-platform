"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import BackButton from "@/components/BackButton";
import ShareToGroupModal from "@/components/groups/ShareToGroupModal";

type Buyer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  budget_min: number;
  budget_max: number;
  status: string;

  agent_id?: number;
  agent_name?: string;

  brokerage_amount?: string;
  remarks?: string;
};

export default function BuyersPage() {
  const router = useRouter();

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [displayBuyers, setDisplayBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [shareBuyerId, setShareBuyerId] = useState<number | null>(null);

  const [agents, setAgents] = useState<any[]>([]);
  const [assignBuyerId, setAssignBuyerId] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  /* ================= FETCH BUYERS ================= */

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

    const role = user.role || user.user_role || "ADMIN";

fetch(
  `/api/buyers/list?tenantId=${tenantId}&userId=${user.id}&role=${role}`
)

      .then((res) => res.json())
      .then((data) => {
        setBuyers(data);
        setDisplayBuyers(data);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= FETCH AGENTS ================= */

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

    fetch(`/api/users/agents?tenantId=${tenantId}`)
      .then((res) => res.json())
      .then((data) => setAgents(data));
  }, []);

  /* ================= SEARCH ================= */

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

    const timer = setTimeout(() => {
      if (!search.trim()) {
        setDisplayBuyers(buyers);
        return;
      }

      fetch(
        `/api/buyers/search?tenantId=${tenantId}&q=${encodeURIComponent(
          search.trim()
        )}`
      )
        .then((res) => res.json())
        .then((data) => setDisplayBuyers(data.results || []));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, buyers]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this buyer?")) return;

    await fetch(`/api/buyers/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setBuyers((p) => p.filter((b) => b.id !== id));
    setDisplayBuyers((p) => p.filter((b) => b.id !== id));
  }

  async function handleAssignAgent() {
    if (!assignBuyerId || !selectedAgent) return;

    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);

    await fetch("/api/buyers/assign-agent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerId: assignBuyerId,
        tenantId: user.tenant_id || user.tenantId,
        agentId: selectedAgent,
        transferredBy: user.id,
      }),
    });

    setAssignBuyerId(null);
    setSelectedAgent(null);

    location.reload();
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="w-full px-6 pt-3">
      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <BackButton />
          <h1 className="text-2xl font-semibold mt-2">Buyer Leads</h1>
        </div>

        <PrimaryButton onClick={() => router.push("/buyers/new")}>
          + Add Buyer
        </PrimaryButton>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search buyers by name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 px-5 text-sm rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#5b5ce2]"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b">
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Budget</th>
              <th className="px-6 py-3 text-left">Brokerage</th>
              <th className="px-6 py-3 text-left">Remarks</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {displayBuyers.map((buyer) => (
              <tr
                key={buyer.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => router.push(`/buyers/${buyer.id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                      {buyer.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {buyer.name}
                      </div>
                      <div className="text-xs text-gray-400">Buyer</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-gray-600">{buyer.email}</td>
                <td className="px-6 py-4 text-gray-600">{buyer.phone}</td>
                <td className="px-6 py-4 text-gray-700">
                  ₹{buyer.budget_min} – ₹{buyer.budget_max}
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {buyer.brokerage_amount || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {buyer.remarks || "—"}
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-600">
                    {buyer.status}
                  </span>
                </td>

                <td
                  className="px-6 py-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end gap-2">
                    <SecondaryButton
                      onClick={() => {
                        setAssignBuyerId(buyer.id);
                        setSelectedAgent(buyer.agent_id || null);
                      }}
                    >
                      {buyer.agent_name ? "Reassign" : "Assign"}
                    </SecondaryButton>

                    <SecondaryButton
                      onClick={() => setShareBuyerId(buyer.id)}
                    >
                      Share
                    </SecondaryButton>

                    <SecondaryButton
                      onClick={() => handleDelete(buyer.id)}
                    >
                      Delete
                    </SecondaryButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shareBuyerId && (
        <ShareToGroupModal
          open
          onClose={() => setShareBuyerId(null)}
          entityType="buyer"
          entityId={shareBuyerId}
        />
      )}

      {assignBuyerId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Assign Agent</h2>

            <select
              className="w-full border rounded-lg px-3 py-2 mb-4"
              value={selectedAgent || ""}
              onChange={(e) => setSelectedAgent(Number(e.target.value))}
            >
              <option value="">Select Agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <SecondaryButton onClick={() => setAssignBuyerId(null)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleAssignAgent}>
                Assign
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
