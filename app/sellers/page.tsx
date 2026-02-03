"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, MoreHorizontal, MapPin, Home, DollarSign, User } from "lucide-react";
import ShareToGroupModal from "@/components/groups/ShareToGroupModal";
import { FileText } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";



// Dropdown Menu Component
function DropdownMenu({ 
  seller, 
  onAssign, 
  onShare, 
  onEdit, 
  onDelete,
  canEdit,
  canDelete 
}: { 
  seller: Seller; 
  onAssign: () => void; 
  onShare: () => void; 
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((p) => !p);
        }}
        className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <MoreHorizontal className="h-5 w-5 text-gray-600" />
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
            className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {canEdit && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onAssign();
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                👤 {seller.assigned_agent_id ? "Reassign Agent" : "Assign Agent"}
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onShare();
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              👥 Share with Group
            </button>

            {canEdit && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onEdit();
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                ✏️ Edit Property
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onDelete();
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

type Seller = {
  id: number;
  owner_name: string;
  owner_contact?: string | null;   
  owner_email?: string | null;
  email?: string | null;  
  property_type: string;
  price: number;
  bedrooms: number;
  location: string; 
  brokerage_type?: "percent" | "fixed" | null;
  brokerage_value?: number | null;
  latest_remark?: string | null;
  assigned_agent_id?: number | null;
  assigned_agent_name?: string | null;
  cover_photo?: string | null;
  looking_for?: "RENT" | "SELL";
  furnishing_preference?: string | null;
};

export default function SellersPage() {
  const router = useRouter();

  // ✅ PERMISSION CHECKS
  const { hasPermission: canAddSeller, loading: addLoading } = usePermission("sellers.add");
  const { hasPermission: canEditSeller, loading: editLoading } = usePermission("sellers.edit");
  const { hasPermission: canDeleteSeller, loading: deleteLoading } = usePermission("sellers.delete");

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [displaySellers, setDisplaySellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shareSellerId, setShareSellerId] = useState<number | null>(null);

  const [agents, setAgents] = useState<any[]>([]);
  const [assignSellerId, setAssignSellerId] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  const RESIDENTIAL_TYPES = ["flat", "villa", "house"];
  const COMMERCIAL_TYPES = ["shop", "office"];

  const totalValue = sellers.reduce(
    (sum, s) => sum + Number(s.price || 0),
    0
  );
  const residentialCount = sellers.filter((s) =>
    RESIDENTIAL_TYPES.includes(s.property_type?.toLowerCase())
  ).length;

  const commercialCount = sellers.filter((s) =>
    COMMERCIAL_TYPES.includes(s.property_type?.toLowerCase())
  ).length;

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

    // 💰 budget number (1200000 etc)
    const budgetValue = !isNaN(Number(q)) ? Number(q) : null;

    // 🏠 bhk (1bhk, 2 bhk)
    const bhkMatch = q.match(/(\d+)\s*bhk/);
    const bhkValue = bhkMatch ? Number(bhkMatch[1]) : null;

    setDisplaySellers(
      sellers.filter((s) =>
        s.owner_name?.toLowerCase().includes(q) ||
        s.property_type?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        (budgetValue !== null && Number(s.price) <= budgetValue) ||
        (bhkValue !== null && Number(s.bedrooms) === bhkValue)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="w-full px-2 sm:px-3 md:px-4 pt-3 sm:pt-4 pb-8 sm:pb-12 space-y-4 sm:space-y-6 lg:space-y-8">

        {/* Search Bar and Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, location, budget, or BHK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 sm:h-12 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm rounded-lg border border-blue-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-900 transition-all"
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button className="h-11 sm:h-12 w-11 sm:w-12 flex items-center justify-center border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all flex-shrink-0">
              <Filter className="w-4 sm:w-5 h-4 sm:h-5 text-blue-900" />
            </button>
            
            {/* ✅ ADD PROPERTY BUTTON - CONDITIONAL */}
            {!addLoading && canAddSeller && (
              <button
                onClick={() => router.push("/sellers/new")}
                className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 h-11 sm:h-12 text-sm font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-800 active:bg-gray-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Add Property</span>
                <span className="xs:hidden">Add Property</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Properties */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 truncate">Total Properties</p>
                <h4 className="text-2xl sm:text-3xl font-bold text-gray-900">{sellers.length}</h4>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 ml-2">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Residential */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 truncate">Residential</p>
                <h4 className="text-2xl sm:text-3xl font-bold text-gray-900">{residentialCount}</h4>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 ml-2">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Commercial */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 truncate">Commercial</p>
                <h4 className="text-2xl sm:text-3xl font-bold text-gray-900">{commercialCount}</h4>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 ml-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-all col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 truncate">Total Value</p>
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">₹{(totalValue / 10000000).toFixed(1)} Cr</h4>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 ml-2">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {displaySellers.map((seller) => (
            <div
              key={seller.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all relative overflow-hidden group"
            >
              {/* Property Image */}
              <div className="relative w-full h-36 sm:h-40 overflow-hidden rounded-t-lg bg-gray-100">
                {seller.cover_photo ? (
                  <>
                    <img
                      src={seller.cover_photo.replace('-thumb.jpg', '.jpg') || "/placeholder.svg"}
                      alt="property"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="eager"
                      fetchPriority="high"
                      style={{ 
                        imageRendering: '-webkit-optimize-contrast',
                        filter: 'contrast(1.05) saturate(1.1)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Home className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
                  </div>
                )}
                {seller.assigned_agent_id && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold bg-emerald-500 text-white shadow-md">
                      ✓ Assigned
                    </span>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 relative">
                {/* Title and Type */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 capitalize truncate">{seller.property_type}</h3>
                  <p className="text-xs font-semibold text-gray-600 mt-0.5 sm:mt-1">{seller.bedrooms} BHK</p>
                </div>

                {/* Looking For & Furnishing */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {seller.looking_for && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold bg-gray-100 text-gray-700">
                      {seller.looking_for === "RENT" ? "Rent" : "Sell"}
                    </span>
                  )}
                  {seller.furnishing_preference && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-semibold bg-gray-100 text-gray-700 truncate">
                      {seller.furnishing_preference
                        .replace("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  )}
                </div>

                {/* Key Info Cards */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">Beds</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{seller.bedrooms}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">Brokerage</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {seller.brokerage_type && seller.brokerage_value ? (
                        seller.brokerage_type === "percent" ? (
                          `${seller.brokerage_value}%`
                        ) : (
                          `₹${Number(seller.brokerage_value).toLocaleString()}`
                        )
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">Price</p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">₹{seller.price}</p>
                  </div>
                </div>

                {/* Seller & Agent Info */}
                <div className="pt-2 sm:pt-3 border-t border-gray-200 space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </div>
                      <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{seller.owner_name}</span>
                    </div>
                    {seller.assigned_agent_name && (
                      <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-emerald-50 text-emerald-700 whitespace-nowrap flex-shrink-0">
                        {seller.assigned_agent_name}
                      </span>
                    )}
                  </div>
                  {seller.owner_contact && (
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-medium text-gray-600 min-w-0">
                      <span className="flex-shrink-0">📞</span>
                      <span className="truncate">{seller.owner_contact}</span>
                    </div>
                  )}
                  {(seller.owner_email || seller.email) && (
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-medium text-gray-600 min-w-0">
                      <span className="flex-shrink-0">✉️</span>
                      <span className="truncate">{seller.owner_email || seller.email}</span>
                    </div>
                  )}
                  {seller.latest_remark && (
                    <div className="flex items-start gap-1.5 sm:gap-2 bg-gray-50 p-1.5 sm:p-2 rounded-lg border border-gray-200">
                      <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs text-gray-700 font-medium line-clamp-2">
                        {seller.latest_remark}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 sm:pt-3 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/sellers/${seller.id}`);
                    }}
                    className="flex-1 border border-gray-300 bg-white text-gray-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold hover:bg-gray-50 active:bg-gray-100 transition-all"
                  >
                    View Details
                  </button>
                  
                  {/* ✅ DROPDOWN MENU WITH PERMISSIONS */}
                  <DropdownMenu 
                    seller={seller}
                    canEdit={!editLoading && canEditSeller}
                    canDelete={!deleteLoading && canDeleteSeller}
                    onAssign={() => {
                      setAssignSellerId(seller.id);
                      setSelectedAgent(seller.assigned_agent_id || null);
                    }}
                    onShare={() => setShareSellerId(seller.id)}
                    onEdit={() => router.push(`/sellers/new?id=${seller.id}`)}
                    onDelete={() => handleDelete(seller.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displaySellers.length === 0 && !loading && (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center border border-gray-200">
            <div className="text-gray-300 text-4xl sm:text-5xl mb-3">🏠</div>
            <p className="text-gray-600 font-semibold text-sm sm:text-base">No properties found</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Try adjusting your search or add a new property</p>
          </div>
        )}
      </div>

      {/* ASSIGN MODAL */}
      {assignSellerId && canEditSeller && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md space-y-4 sm:space-y-6 shadow-2xl border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">👤 Assign Agent</h2>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Select Agent</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                value={selectedAgent || ""}
                onChange={(e) => setSelectedAgent(Number(e.target.value))}
              >
                <option value="">Choose an agent...</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
              <button
                onClick={() => setAssignSellerId(null)}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSeller}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:bg-gray-700 font-semibold transition-all"
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
          open={true}
          onClose={() => setShareSellerId(null)}
          entityType="seller"
          entityId={shareSellerId}
        />
      )}
    </div>
  );
}