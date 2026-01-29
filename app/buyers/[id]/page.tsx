"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FollowUpForm from "@/components/follow-ups/FollowUpForm";
import FollowUpList from "@/components/follow-ups/FollowUpList";
import DocumentSection from "@/components/DocumentSection";
import dynamic from "next/dynamic";

const PropertyMap = dynamic(
  () => import("@/components/PropertyMap"),
  { ssr: false }
);

export default function BuyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const buyerId = Number(params?.id);

  const rawUser = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
  const loggedUser = rawUser ? JSON.parse(rawUser) : null;
  const tenantId = loggedUser?.tenant_id ?? loggedUser?.tenantId;
  const agentId = loggedUser?.id;

  const [buyer, setBuyer] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [sellerPhotos, setSellerPhotos] = useState<Record<number, any[]>>({});
  const [openImages, setOpenImages] = useState<Record<number, boolean>>({});

  const [areaSize, setAreaSize] = useState("");
  const [govtEstimatedPrice, setGovtEstimatedPrice] = useState<number | null>(null);
  const [loans, setLoans] = useState<any[]>([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoanId, setUploadLoanId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [activeTab, setActiveTab] = useState("properties");

  // 🔵 INTERNAL REMARKS (NEW SYSTEM)
  const [latestRemark, setLatestRemark] = useState("");
  const [remarksHistory, setRemarksHistory] = useState<any[]>([]);
  const [savingRemark, setSavingRemark] = useState(false);

  async function fetchActivityLogs(tenantId: number) {
    const res = await fetch(
      `/api/activity-logs?tenantId=${tenantId}&entityType=buyer&entityId=${buyerId}`
    );
    if (res.ok) {
      setActivityLogs(await res.json());
    }
  }

  const STATUS_OPTIONS = [
    "New",
    "Contacted",
    "Interested",
    "Site Visit Planned",
    "Deal Closed",
    "Discarded",
  ];

  async function fetchRemarks() {
    const res = await fetch(
      `/api/internal-remarks?entityType=buyer&entityId=${buyerId}`
    );
    if (!res.ok) return;

    const data = await res.json();
    setRemarksHistory(data);
    setLatestRemark(data[0]?.remark || "");
  }

  async function fetchSellerPhotos(sellerId: number) {
    if (sellerPhotos[sellerId]) return;
    const res = await fetch(`/api/sellers/${sellerId}/photos`);
    if (!res.ok) return;
    const data = await res.json();
    setSellerPhotos((prev) => ({
      ...prev,
      [sellerId]: Array.isArray(data) ? data : [],
    }));
  }

  useEffect(() => {
    if (!buyerId) return;

    async function loadData() {
      try {
        const raw = localStorage.getItem("loggedUser");
        if (!raw) return;
        const user = JSON.parse(raw);
        const tenantId = user.tenant_id ?? user.tenantId;

        const buyerRes = await fetch(`/api/buyers/${buyerId}`, {
          headers: { "x-tenant-id": String(tenantId) },
        });
        if (buyerRes.ok) {
          const data = await buyerRes.json();
          setBuyer(data);
        }

        fetchRemarks();

        const matchRes = await fetch(`/api/buyers/${buyerId}/matches`, {
          headers: { "x-tenant-id": String(tenantId) },
        });

        const activityRes = await fetch(
          `/api/activity-logs?tenantId=${tenantId}&entityType=buyer&entityId=${buyerId}`
        );

        if (activityRes.ok) {
          setActivityLogs(await activityRes.json());
        }

        if (matchRes.ok) {
          const sellers = (await matchRes.json()).matches || [];
          setMatches(sellers);
          sellers.forEach((s: any) => fetchSellerPhotos(s.id));
          const map: Record<number, string> = {};
          sellers.forEach((s: any) => {
            if (s.buyer_property_status) {
              map[s.id] = s.buyer_property_status;
            }
          });
          setStatusMap(map);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [buyerId]);

  async function handleGovtPriceEstimate() {
    if (!areaSize || !buyer?.location) return;
    const res = await fetch(
      `/api/govt-price?location=${encodeURIComponent(buyer.location)}&size=${areaSize}`
    );
    if (!res.ok) return;
    const data = await res.json();
    setGovtEstimatedPrice(data.estimatedPrice);
  }

  async function saveRemark() {
    if (!latestRemark.trim()) return;

    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;
    const user = JSON.parse(raw);

    setSavingRemark(true);

    await fetch("/api/internal-remarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entityType: "buyer",
        entityId: buyerId,
        remark: latestRemark,
        createdBy: user.id,
      }),
    });

    setSavingRemark(false);
    fetchRemarks();
  }

  function statusBadge(status: string) {
    switch (status) {
      case "Interested":
        return "bg-green-100 text-green-700";
      case "Site Visit Planned":
        return "bg-blue-100 text-blue-700";
      case "Deal Closed":
        return "bg-purple-100 text-purple-700";
      case "Discarded":
        return "bg-gray-200 text-gray-500";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Buyer not found</div>
      </div>
    );
  }

  const tabs = [
    { id: "properties", label: "Matched Properties" },
    { id: "remarks", label: "Internal Remarks" },
    { id: "documents", label: "Documents" },
    { id: "followups", label: "Follow-ups" },
    { id: "activity", label: "Activity Timeline" },
    { id: "overview", label: "About" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full px-4 lg:px-6 pt-3 pb-6 space-y-4">




        {/* HEADER CARD - PREMIUM DESIGN */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-blue-100 p-6">

          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-blue-50 to-transparent rounded-full -mr-20 -mt-20 opacity-60"></div>

          <div className="relative flex justify-between items-start gap-6">
            <div className="flex gap-6 flex-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-xl shadow-md flex-shrink-0">
                {buyer.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{buyer.name}</h1>
                  <span className={`px-4 py-1 text-xs rounded-full font-semibold ${statusBadge(buyer.status)} shadow-sm`}>
                    {buyer.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-6 mt-4">

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-lg">✉️</span>
                    <span className="font-medium">{buyer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-lg">📞</span>
                    <span className="font-medium">{buyer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-lg">📍</span>
                    <span className="font-medium">{buyer.radius_km} km radius</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFollowUpModal(true)}
              className="px-6 py-3 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md hover:shadow-lg flex-shrink-0"
            >
              + Follow-up
            </button>
          </div>
        </div>

        {/* KEY INFO CARDS - MODERN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            label="Property Type"
            value={buyer.requirement || "—"}
          />
          <InfoCard label="Budget Range" value={`₹${buyer.budget_min} – ₹${buyer.budget_max}`} />
          <InfoCard label="Bedrooms" value={`${buyer.bedrooms} BHK`} />
          <InfoCard label="Search Radius" value={`${buyer.radius_km} km`} />
        </div>

        {/* TABBED CARD - PREMIUM DESIGN */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* TAB HEADERS */}
          <div className="flex border-b border-gray-200 overflow-x-auto bg-gradient-to-r from-gray-50 to-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold text-sm whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50/30"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="p-8">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Buyer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Email</p>
                    <p className="text-gray-900 font-semibold text-sm break-all">{buyer.email}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Phone</p>
                    <p className="text-gray-900 font-semibold text-sm">{buyer.phone}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Budget</p>
                    <p className="text-gray-900 font-semibold text-sm">₹{buyer.budget_min} – ₹{buyer.budget_max}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Property Type</p>
                    <p className="text-gray-900 font-semibold text-sm">{buyer.requirement || "—"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* MATCHED PROPERTIES TAB */}
            {activeTab === "properties" && (
              <div className="space-y-6">
                {matches.length === 0 ? (
                  <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-2xl p-16 text-center border-2 border-dashed border-blue-200">
                    <div className="text-blue-300 text-6xl mb-4">🏠</div>
                    <p className="text-gray-600 font-semibold text-lg">No matched properties yet</p>
                    <p className="text-gray-500 text-sm mt-2">Properties will appear here as they match buyer criteria</p>
                  </div>
                ) : (
                  matches.map((seller) => {
                    const lat = seller.lat ?? seller.latitude;
                    const lng = seller.lng ?? seller.longitude;
                    const status = statusMap[seller.id] ?? seller.buyer_property_status ?? "New";
                    const isDiscarded = status === "Discarded";

                    return (
                      <div
                        key={seller.id}
                        className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border transition-all ${isDiscarded
                            ? "opacity-60 border-gray-300"
                            : "border-blue-200 hover:shadow-xl hover:border-blue-300"
                          }`}
                        style={{
                          borderLeft: isDiscarded ? undefined : "5px solid #2563eb"
                        }}
                      >
                        <div className="p-4">
                          <div className="flex justify-between gap-4 items-start flex-wrap">

                            <div className="space-y-4 flex-1 min-w-[300px]">
                              <div className="flex gap-2 mb-2">

                                <button
                                  onClick={() => setOpenImages((prev) => ({ ...prev, [seller.id]: !prev[seller.id] }))}
                                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
                                >
                                  {openImages[seller.id] ? "Hide Images" : "Show Images"}
                                </button>
                                <button
                                  onClick={() => setOpenMap((prev) => ({ ...prev, [seller.id]: !prev[seller.id] }))}
                                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
                                >
                                  {openMap[seller.id] ? "Hide Map" : "Show Map"}
                                </button>
                              </div>

                              {openImages[seller.id] && sellerPhotos[seller.id]?.length > 0 && (
                                <div className="space-y-2">
                                  <img
                                    src={sellerPhotos[seller.id][0].photo_url || "/placeholder.svg"}
                                    alt="property"
                                    className="w-64 h-40 object-cover rounded-lg border-2 border-gray-200"
                                  />
                                  <div className="flex gap-2">
                                    {sellerPhotos[seller.id].slice(1, 4).map((p: any) => (
                                      <img
                                        key={p.id}
                                        src={p.photo_url || "/placeholder.svg"}
                                        alt="thumb"
                                        className="w-20 h-14 object-cover rounded-md border border-gray-200"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {openMap[seller.id] && lat && lng && (
                                <div className="h-[240px] rounded-lg overflow-hidden border-2 border-gray-200">
                                  <PropertyMap lat={Number(lat)} lng={Number(lng)} label={seller.location} />
                                </div>
                              )}

                              <div className="mt-4 pt-4 border-t border-gray-100">

                                <div className="mb-3">
                                  {/* Property Title */}
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-gray-900 capitalize">
                                      {seller.property_type || "Property"}
                                    </h3>

                                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                      {seller.bedrooms} BHK
                                    </span>
                                  </div>

                                  {/* Price */}
                                  <p className="mt-1 text-xl font-bold text-blue-600">
                                    ₹{seller.price?.toLocaleString()}
                                  </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 space-y-1">

                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Seller Name</p>
                                    <p className="text-gray-900 font-medium">{seller.seller_name}</p>
                                  </div>
                                  {seller.seller_contact && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 uppercase">Contact</p>
                                      <p className="text-gray-900 font-medium">📞 {seller.seller_contact}</p>
                                    </div>
                                  )}
                                  {seller.seller_email && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                                      <p className="text-gray-900 font-medium break-all">✉️ {seller.seller_email}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-6">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4 w-[280px]">

                                <h3 className="text-sm font-bold mb-4 text-gray-800 flex items-center gap-2">
                                  <span>📊</span> Government Price Estimation
                                </h3>
                                <div className="flex flex-col gap-3">
                                  <input
                                    type="number"
                                    placeholder="Enter area size (sq ft)"
                                    value={areaSize}
                                    onChange={(e) => setAreaSize(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <button
                                    onClick={handleGovtPriceEstimate}
                                    className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                                  >
                                    Get Estimate
                                  </button>
                                </div>
                                {govtEstimatedPrice && (
                                  <p className="mt-4 text-emerald-700 text-sm font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                                    ✓ Estimated Value: ₹{govtEstimatedPrice.toLocaleString()}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Buyer Action</label>
                                <select
                                  value={status}
                                  disabled={isDiscarded}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    setStatusMap((p) => ({ ...p, [seller.id]: newStatus }));

                                    const raw = localStorage.getItem("loggedUser");
                                    if (!raw) return;
                                    const user = JSON.parse(raw);
                                    const tenantId = user.tenant_id ?? user.tenantId;

                                    const res = await fetch(`/api/buyers/${buyerId}/property-status`, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json", "x-tenant-id": String(tenantId) },
                                      body: JSON.stringify({ sellerId: seller.id, status: newStatus }),
                                    });

                                    if (res.ok) {
                                      const data = await res.json();
                                      if (data?.buyerStatus) {
                                        setBuyer((prev: any) => ({ ...prev, status: data.buyerStatus }));
                                      }
                                    }
                                  }}
                                  className={`border border-blue-300 rounded-lg px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDiscarded ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white text-gray-900 hover:bg-blue-50"
                                    }`}
                                >
                                  {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* INTERNAL REMARKS TAB */}
            {activeTab === "remarks" && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  Internal Remarks
                </h3>

                {/* 🔹 Latest Remark */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Add New Remark</label>
                  <textarea
                    value={latestRemark}
                    onChange={(e) => setLatestRemark(e.target.value)}
                    rows={5}
                    className="w-full border-2 border-blue-200 rounded-xl px-5 py-4 text-sm font-medium
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-blue-50 placeholder-gray-400"
                    placeholder="Write your internal notes and observations here..."
                  />
                </div>

                <button
                  disabled={savingRemark}
                  onClick={saveRemark}
                  className="px-6 py-3 text-sm font-semibold rounded-lg bg-blue-600 text-white
                   hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {savingRemark ? "💾 Saving..." : "✓ Save Remark"}
                </button>

                {/* 🔹 History */}
                {remarksHistory.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">
                      Remark History ({remarksHistory.length})
                    </h4>

                    <div className="space-y-3">
                      {remarksHistory.map((r, idx) => (
                        <div
                          key={r.id}
                          className="relative border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white p-5 rounded-r-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white"></div>
                          <p className="text-sm text-gray-800 font-medium leading-relaxed">{r.remark}</p>
                          <p className="text-xs text-gray-500 mt-3 font-semibold">
                            {new Date(r.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === "documents" && (
              <div>
                <DocumentSection entityType="buyer" entityId={buyerId} />
              </div>
            )}

            {/* FOLLOW-UPS TAB */}
            {activeTab === "followups" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Follow-ups</h3>
                  <button
                    onClick={() => setShowFollowUpModal(true)}
                    className="text-sm px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    + Schedule Follow-up
                  </button>
                </div>
                <FollowUpList buyerId={buyerId} />
              </div>
            )}

            {/* ACTIVITY TIMELINE TAB */}
            {activeTab === "activity" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Activity Timeline</h3>
                {activityLogs.length === 0 ? (
                  <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-2xl p-16 text-center border-2 border-dashed border-blue-200">
                    <div className="text-blue-300 text-6xl mb-4">📋</div>
                    <p className="text-gray-600 font-semibold text-lg">No activity yet</p>
                    <p className="text-gray-500 text-sm mt-2">Activity will appear here as interactions occur</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log, idx) => (
                      <div key={idx} className="relative border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white p-5 rounded-r-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white"></div>
                        <div className="text-sm text-gray-800 font-semibold">{log.description}</div>
                        <div className="text-xs text-gray-500 mt-2 font-medium">
                          <span className="font-semibold">by {log.performed_by_name ?? "System"}</span>
                          {log.performed_by_role && <span className="ml-1 text-gray-400">({log.performed_by_role})</span>}
                          {" • "}
                          <time>{new Date(log.created_at).toLocaleString()}</time>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MODALS */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-6 shadow-2xl border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900">
                📄 Upload Document
              </h3>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Select file
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm file:mr-4 file:py-3 file:px-4
                       file:rounded-lg file:border-0 file:font-semibold
                       file:bg-blue-100 file:text-blue-700
                       hover:file:bg-blue-200 file:cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-5 py-2.5 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-semibold transition-all shadow-md hover:shadow-lg"
                  onClick={async () => {
                    if (!uploadFile || !uploadLoanId) return;
                    const formData = new FormData();
                    formData.append("file", uploadFile);
                    await fetch(`/api/loans/${uploadLoanId}/documents`, {
                      method: "POST",
                      body: formData,
                    });
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadLoanId(null);
                  }}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {showFollowUpModal && tenantId && agentId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-6 shadow-2xl border border-blue-100">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">📅 Add Follow-up</h3>
                <button onClick={() => setShowFollowUpModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                  ✕
                </button>
              </div>
              <FollowUpForm
                tenantId={tenantId}
                buyerId={buyerId}
                agentId={agentId}
                onSuccess={() => setShowFollowUpModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-5 hover:shadow-xl transition-shadow">
     <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">
  {label}
</p>
<p className="text-lg font-bold text-gray-900">
  {value}
</p>

    </div>
  );
}