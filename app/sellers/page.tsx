"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, MoreHorizontal, MapPin, Home, DollarSign, User } from "lucide-react";
import ShareToGroupModal from "@/components/groups/ShareToGroupModal";

// Dropdown Menu Component
function DropdownMenu({ seller, onAssign, onShare, onDelete }: { 
  seller: Seller; 
  onAssign: () => void; 
  onShare: () => void; 
  onDelete: () => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((p) => !p);
        }}
        className="h-9 w-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <MoreHorizontal className="h-4 w-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          {/* BACKDROP */}
          <div
            className="fixed inset-0 z-10"
            onMouseDown={() => setIsOpen(false)}
          />

          {/* MENU */}
          <div
            className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]"

            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsOpen(false);
                onAssign();
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
            >
              {seller.assigned_agent_id ? "Reassign" : "Assign"}
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onShare();
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
            >
              Share
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}


type Seller = {
  id: number;
  owner_name: string;
  property_type: string;
  price: number;
  bedrooms: number;
  brokerage_amount?: string | null;
  remarks?: string | null;
  assigned_agent_id?: number | null;
  assigned_agent_name?: string | null;
};

export default function SellersPage() {
  const router = useRouter();

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [displaySellers, setDisplaySellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shareSellerId, setShareSellerId] = useState<number | null>(null);

  const [agents, setAgents] = useState<any[]>([]);
  const [assignSellerId, setAssignSellerId] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  /* ================= FETCH SELLERS ================= */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

    fetch(`/api/sellers/list?tenantId=${tenantId}&userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setSellers(data.sellers);
          setDisplaySellers(data.sellers);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= FETCH AGENTS ================= */
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

  async function handleAssignSeller() {
    if (!assignSellerId || !selectedAgent) return;

    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;
    const user = JSON.parse(raw);

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
    <div className="w-full min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Top Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          
          
          <div className="flex items-center gap-3 flex-1">

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties by name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={() => router.push("/sellers/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Properties</p>
            <h4 className="text-3xl font-bold text-gray-900">{sellers.length}</h4>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Active Listings</p>
            <h4 className="text-3xl font-bold text-blue-600">
              {sellers.filter(s => s.assigned_agent_id).length}
            </h4>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Unassigned</p>
            <h4 className="text-3xl font-bold text-orange-600">
              {sellers.filter(s => !s.assigned_agent_id).length}
            </h4>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Value</p>
            <h4 className="text-2xl font-bold text-gray-900">
              ₹{(sellers.reduce((sum, s) => sum + s.price, 0) / 10000000).toFixed(1)} Cr
            </h4>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displaySellers.map((seller) => (
            <div
              key={seller.id}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow relative overflow-visible"

            >
              {/* Property Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center relative">
                <Home className="w-12 h-12 text-gray-400" />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    seller.assigned_agent_id 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {seller.assigned_agent_id ? 'ASSIGNED' : 'UNASSIGNED'}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5 space-y-4 relative">
                {/* Title and Type */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{seller.property_type}</h3>
                  <p className="text-sm text-gray-500 mt-1">{seller.bedrooms} BHK</p>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Beds</p>
                      <p className="text-sm font-medium text-gray-900">{seller.bedrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Brokerage</p>
                      <p className="text-sm font-medium text-gray-900">{seller.brokerage_amount || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-sm font-medium text-gray-900">₹{seller.price}</p>
                    </div>
                  </div>
                </div>

                {/* Seller & Agent */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{seller.owner_name}</span>
                    </div>
                    {seller.assigned_agent_name && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                        {seller.assigned_agent_name}
                      </span>
                    )}
                  </div>
                  {seller.remarks && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-500">{seller.remarks}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/sellers/${seller.id}`);
                    }}
                    className="flex-1 border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  
                  <DropdownMenu seller={seller} 
                    onAssign={() => {
                      setAssignSellerId(seller.id);
                      setSelectedAgent(seller.assigned_agent_id || null);
                    }}
                    onShare={() => setShareSellerId(seller.id)}
                    onDelete={() => handleDelete(seller.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {assignSellerId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px]">
            <h2 className="text-lg font-semibold mb-4">Assign Agent</h2>

            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4"
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
              <button
                onClick={() => setAssignSellerId(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSeller}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
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