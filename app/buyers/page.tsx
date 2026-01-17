"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Plus, Mail, Phone, Wallet } from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import ShareToGroupModal from "@/components/groups/ShareToGroupModal";


type Buyer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  budget_min: number;
  budget_max: number;
  status: string;
  assigned_agent_id?: number | null;
  assigned_agent_name?: string | null;
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

    fetch(`/api/buyers/list?tenantId=${tenantId}&userId=${user.id}&role=${role}`)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ENQUIRY":
        return "bg-blue-100 text-blue-800";
      case "NEGOTIATION":
        return "bg-orange-100 text-orange-800";
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-4 space-y-3">
       

        {/* Top Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-64 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="h-11 w-11 flex items-center justify-center border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <button
            onClick={() => router.push("/buyers/new")}
            className="h-11 px-4 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Buyer
          </button>
        </div>

        {/* Buyers Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Buyer Name
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Brokerage
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Agent
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    Remarks
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayBuyers.map((buyer) => (
                  <tr
                    key={buyer.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/buyers/${buyer.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-blue-600">
                            {buyer.name[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {buyer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          {buyer.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          {buyer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-medium text-gray-900">
                        <Wallet className="w-3 h-3 text-gray-400" />
                        ₹{buyer.budget_min} – ₹{buyer.budget_max}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {buyer.brokerage_amount || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                          buyer.status
                        )}`}
                      >
                        {buyer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {buyer.assigned_agent_name ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {buyer.assigned_agent_name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {buyer.remarks || "—"}
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-4 py-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                          onClick={() => {
                            setAssignBuyerId(buyer.id);
                            setSelectedAgent(buyer.assigned_agent_id || null);
                          }}
                        >
                          {buyer.assigned_agent_name ? "Reassign" : "Assign"}
                        </button>

                        <button
                          className="px-4 py-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                          onClick={() => setShareBuyerId(buyer.id)}
                        >
                          Share
                        </button>

                        <button
                          className="px-4 py-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                          onClick={() => handleDelete(buyer.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <span className="text-sm text-gray-600">
              Showing 1-{displayBuyers.length} of {displayBuyers.length} buyers
            </span>
            <div className="flex gap-2">
              <button
                disabled
                className="px-4 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-300 rounded-lg cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareBuyerId && (
        <ShareToGroupModal
          open
          onClose={() => setShareBuyerId(null)}
          entityType="buyer"
          entityId={shareBuyerId}
        />
      )}

      {/* Assign Agent Modal */}
      {assignBuyerId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl border border-slate-200">

            <h2 className="text-lg font-semibold mb-4 text-blue-600">
  Assign Agent
</h2>

            <select
  className="w-full border rounded-lg px-3 py-2 mb-4 text-sm
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500"


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
              <PrimaryButton onClick={handleAssignAgent}>Assign</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}