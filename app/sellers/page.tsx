"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import BackButton from "@/components/BackButton";
import ShareToGroupModal from "@/components/groups/ShareToGroupModal";

type Seller = {
  id: number;
  owner_name: string;
  property_type: string;
  price: number;
  bedrooms: number;
  brokerage_amount?: string | null;
  remarks?: string | null;

  /* ✅ ADDED */
  agent_id?: number | null;
  agent_name?: string | null;
};

export default function SellersPage() {
  const router = useRouter();

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [displaySellers, setDisplaySellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shareSellerId, setShareSellerId] = useState<number | null>(null);

  /* ✅ ASSIGN STATES */
  const [agents, setAgents] = useState<any[]>([]);
  const [assignSellerId, setAssignSellerId] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

   fetch(
  `/api/sellers/list?tenantId=${tenantId}&userId=${user.id}`
)


      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setSellers(data.sellers);
          setDisplaySellers(data.sellers);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ✅ FETCH AGENTS */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);

    fetch(`/api/users/agents?tenantId=${user.tenantId}`)
      .then((res) => res.json())
      .then((data) => setAgents(data));
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!search.trim()) {
      setDisplaySellers(sellers);
      return;
    }

    const q = search.toLowerCase();
    setDisplaySellers(
      sellers.filter(
        (s) =>
          s.owner_name?.toLowerCase().includes(q) ||
          s.property_type?.toLowerCase().includes(q)
      )
    );
  }, [search, sellers]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this property?")) return;
    await fetch(`/api/sellers/${id}`, { method: "DELETE" });
    setSellers((p) => p.filter((s) => s.id !== id));
    setDisplaySellers((p) => p.filter((s) => s.id !== id));
  }

  /* ✅ ASSIGN SELLER */
  async function handleAssignSeller() {
    if (!assignSellerId || !selectedAgent) return;

    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;
    const user = JSON.parse(raw);

     console.log("ASSIGN PAYLOAD", {
    tenantId: user.tenantId,
    sellerId: assignSellerId,
    agentId: selectedAgent,
  });

  await fetch("/api/sellers/assign-agent", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenantId: user.tenantId,
      sellerId: assignSellerId,
      agentId: selectedAgent,
    }),
  });

    setAssignSellerId(null);
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
          <h1 className="text-2xl font-semibold mt-2">
            Sellers / Properties
          </h1>
        </div>

        <PrimaryButton onClick={() => router.push("/sellers/new")}>
          + Add Property
        </PrimaryButton>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-4">
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search sellers by name or property type"
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
              <th className="px-6 py-3 text-left">Property Type</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Beds</th>
              <th className="px-6 py-3 text-left">Brokerage</th>
              <th className="px-6 py-3 text-left">Remarks</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {displaySellers.map((seller) => (
              <tr
                key={seller.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => router.push(`/sellers/${seller.id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                      {seller.owner_name?.[0]?.toUpperCase() || "?"}

                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {seller.owner_name}
                      </div>
                      <div className="text-xs text-gray-400">Seller</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">{seller.property_type}</td>
                <td className="px-6 py-4">₹{seller.price}</td>
                <td className="px-6 py-4">{seller.bedrooms} BHK</td>
                <td className="px-6 py-4">
                  {seller.brokerage_amount || "—"}
                </td>
                <td className="px-6 py-4">
                  {seller.remarks || "—"}
                </td>

                <td
                  className="px-6 py-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end gap-2">
                    <SecondaryButton
                      onClick={() => {
                        setAssignSellerId(seller.id);
                        setSelectedAgent(seller.agent_id || null);
                      }}
                    >
                      {seller.agent_id ? "Reassign" : "Assign"}
                    </SecondaryButton>

                    <SecondaryButton
                      onClick={() => setShareSellerId(seller.id)}
                    >
                      Share
                    </SecondaryButton>

                    <SecondaryButton
                      onClick={() => handleDelete(seller.id)}
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

      {/* ASSIGN MODAL */}
      {assignSellerId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px]">
            <h2 className="text-lg font-semibold mb-4">
              Assign Agent
            </h2>

            <select
              className="w-full border rounded-lg px-3 py-2 mb-4"
              value={selectedAgent || ""}
              onChange={(e) =>
                setSelectedAgent(Number(e.target.value))
              }
            >
              <option value="">Select Agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <SecondaryButton
                onClick={() => setAssignSellerId(null)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleAssignSeller}>
                Assign
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareSellerId && (
        <ShareToGroupModal
          open
          onClose={() => setShareSellerId(null)}
          entityType="seller"
          entityId={shareSellerId}
        />
      )}
    </div>
  );
}
