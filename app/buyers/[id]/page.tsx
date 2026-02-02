"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FollowUpForm from "@/components/follow-ups/FollowUpForm";
import FollowUpList from "@/components/follow-ups/FollowUpList";
import DocumentSection from "@/components/DocumentSection";
import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
});

export default function BuyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const buyerId = Number(params?.id);

  const rawUser =
    typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
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
  const [govtEstimatedPrice, setGovtEstimatedPrice] = useState<number | null>(
    null
  );
  const [loans, setLoans] = useState<any[]>([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoanId, setUploadLoanId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [activeTab, setActiveTab] = useState("properties");

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
      `/api/govt-price?location=${encodeURIComponent(
        buyer.location
      )}&size=${areaSize}`
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
      <div className="w-full px-3 sm:px-4 lg:px-6 pt-3 pb-6 space-y-3 sm:space-y-4">
        {/* HEADER CARD */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-blue-100 p-4 sm:p-6">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-b from-blue-50 to-transparent rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 opacity-60"></div>

          <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6">
            <div className="flex gap-4 sm:gap-6 flex-1 w-full">
              <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-base shadow flex-shrink-0">
                {buyer.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    {buyer.name}
                  </h1>
                  <span
                    className={`px-3 sm:px-4 py-1 text-xs rounded-full font-semibold ${statusBadge(
                      buyer.status
                    )} shadow-sm w-fit`}
                  >
                    {buyer.status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-sm">✉️</span>
                    <span className="font-medium truncate">{buyer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-sm">📞</span>
                    <span className="font-medium">{buyer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-sm">📍</span>
                    <span className="font-medium">{buyer.radius_km} km radius</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFollowUpModal(true)}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded-lg shadow hover:bg-blue-800 active:bg-blue-900 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              + Follow-up
            </button>
          </div>
        </div>

        {/* KEY INFO CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <InfoCard label="Property Type" value={buyer.requirement || "—"} />
          <InfoCard
            label="Budget Range"
            value={`₹${buyer.budget_min} – ₹${buyer.budget_max}`}
          />
          <InfoCard label="Bedrooms" value={`${buyer.bedrooms} BHK`} />
          <InfoCard label="Search Radius" value={`${buyer.radius_km} km`} />
        </div>

        {/* TABBED CARD */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* TAB HEADERS */}
          <div className="flex border-b border-gray-200 overflow-x-auto bg-gradient-to-r from-gray-50 to-white scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2.5 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${activeTab === tab.id
                    ? "border-blue-900 text-blue-900 bg-blue-50/30"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="p-3 sm:p-4 lg:p-6">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Buyer Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 sm:p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
                      Email
                    </p>
                    <p className="text-gray-900 font-semibold text-sm break-all">
                      {buyer.email}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 sm:p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
                      Phone
                    </p>
                    <p className="text-gray-900 font-semibold text-sm">
                      {buyer.phone}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 sm:p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
                      Budget
                    </p>
                    <p className="text-gray-900 font-semibold text-sm">
                      ₹{buyer.budget_min} – ₹{buyer.budget_max}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 sm:p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">
                      Property Type
                    </p>
                    <p className="text-gray-900 font-semibold text-sm">
                      {buyer.requirement || "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MATCHED PROPERTIES TAB - PROFESSIONAL VERSION */}
            {activeTab === "properties" && (
              <div className="space-y-4 sm:space-y-6">
                {matches.length === 0 ? (
                  <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-xl p-6 sm:p-8 text-center border border-dashed border-blue-200">
                    <div className="text-blue-300 text-3xl mb-3">🏠</div>
                    <p className="text-gray-600 font-semibold text-base sm:text-lg">
                      No matched properties yet
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Properties will appear here as they match buyer criteria
                    </p>
                  </div>
                ) : (
                  matches.map((seller) => {
                    const lat = seller.lat ?? seller.latitude;
                    const lng = seller.lng ?? seller.longitude;
                    const status =
                      statusMap[seller.id] ?? seller.buyer_property_status ?? "New";
                    const isDiscarded = status === "Discarded";

                    // Match percentage data
                    const matchPercentage = seller.matchPercentage || 0;
                    const matchDetails = seller.matchDetails || {};
                    const matchScore = seller.matchScore || 0;
                    const maxScore = seller.maxScore || 6;

                    // Badge color based on percentage
                    const getMatchBadgeColor = (percentage: number) => {
                      if (percentage === 100) return "bg-gradient-to-r from-green-500 to-green-600 text-white";
                      if (percentage >= 80) return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
                      if (percentage >= 60) return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
                      return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
                    };

                    return (
                      <div
                        key={seller.id}
                        className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border transition-all ${isDiscarded
                            ? "opacity-60 border-gray-300"
                            : "border-blue-200 hover:shadow-xl hover:border-blue-300"
                          }`}
                        style={{
                          borderLeft: isDiscarded ? undefined : "5px solid #2563eb",
                        }}
                      >
                        {/* 🎯 MATCH PERCENTAGE BADGE - Compact Top Right */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className={`${getMatchBadgeColor(matchPercentage)} px-3 py-1.5 rounded-full shadow-md font-bold text-xs flex items-center gap-1.5`}>
                            <span className="text-sm">🎯</span>
                            <span>{matchPercentage}%</span>
                          </div>
                        </div>

                        <div className="p-3 sm:p-4 lg:p-6">
                          {/* ✨ PROFESSIONAL MATCH PILLS - Horizontal Flow */}
                          <div className="mb-4 flex flex-wrap gap-2">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${matchDetails.location ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                              <span>{matchDetails.location ? '✓' : '✗'}</span>
                              <span>Location</span>
                            </div>

                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${matchDetails.budget ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                              <span>{matchDetails.budget ? '✓' : '✗'}</span>
                              <span>Budget</span>
                            </div>

                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${matchDetails.bedrooms ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                              <span>{matchDetails.bedrooms ? '✓' : '✗'}</span>
                              <span>Bedrooms</span>
                            </div>

                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${matchDetails.propertyType ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                              <span>{matchDetails.propertyType ? '✓' : '✗'}</span>
                              <span>Type</span>
                            </div>

                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${matchDetails.lookingFor ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                              <span>{matchDetails.lookingFor ? '✓' : '✗'}</span>
                              <span>Buy/Rent</span>
                            </div>

                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${matchDetails.furnishing ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                              <span>{matchDetails.furnishing ? '✓' : '✗'}</span>
                              <span>Furnishing</span>
                            </div>

                            {/* Match Score Summary Pill */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                              <span className="text-sm">📊</span>
                              <span>{matchScore}/{maxScore}</span>
                            </div>
                          </div>

                          <div className="flex flex-col lg:flex-row justify-between gap-4 items-start">
                            {/* LEFT COLUMN */}
                            <div className="space-y-4 flex-1 w-full min-w-0">
                              <div className="flex flex-wrap gap-2 mb-2">
                                <button
                                  onClick={() =>
                                    setOpenImages((prev) => ({
                                      ...prev,
                                      [seller.id]: !prev[seller.id],
                                    }))
                                  }
                                  className="text-xs font-semibold text-blue-900 hover:text-blue-800 hover:underline px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
                                >
                                  {openImages[seller.id]
                                    ? "Hide Images"
                                    : "Show Images"}
                                </button>
                                <button
                                  onClick={() =>
                                    setOpenMap((prev) => ({
                                      ...prev,
                                      [seller.id]: !prev[seller.id],
                                    }))
                                  }
                                  className="text-xs font-semibold text-blue-900 hover:text-blue-800 hover:underline px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
                                >
                                  {openMap[seller.id] ? "Hide Map" : "Show Map"}
                                </button>
                              </div>

                              {openImages[seller.id] &&
                                sellerPhotos[seller.id]?.length > 0 && (
                                  <div className="space-y-2">
                                    <img
                                      src={
                                        sellerPhotos[seller.id][0].photo_url ||
                                        "/placeholder.svg"
                                      }
                                      alt="property"
                                      className="w-full max-w-md h-40 sm:h-48 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <div className="flex gap-2 overflow-x-auto">
                                      {sellerPhotos[seller.id]
                                        .slice(1, 4)
                                        .map((p: any) => (
                                          <img
                                            key={p.id}
                                            src={p.photo_url || "/placeholder.svg"}
                                            alt="thumb"
                                            className="w-20 h-14 object-cover rounded-md border border-gray-200 flex-shrink-0"
                                          />
                                        ))}
                                    </div>
                                  </div>
                                )}

                              {openMap[seller.id] && lat && lng && (
                                <div className="h-[200px] sm:h-[240px] rounded-lg overflow-hidden border-2 border-gray-200">
                                  <PropertyMap
                                    lat={Number(lat)}
                                    lng={Number(lng)}
                                    label={seller.location}
                                  />
                                </div>
                              )}

                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="mb-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 capitalize">
                                      {seller.property_type || "Property"}
                                    </h3>
                                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-900 w-fit">
                                      {seller.bedrooms} BHK
                                    </span>
                                  </div>
                                  <p className="mt-1 text-base sm:text-lg font-semibold text-blue-900">
                                    ₹{seller.price?.toLocaleString()}
                                  </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                      Seller Name
                                    </p>
                                    <p className="text-gray-900 font-medium">
                                      {seller.seller_name}
                                    </p>
                                  </div>
                                  {seller.seller_contact && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Contact
                                      </p>
                                      <p className="text-gray-900 font-medium">
                                        📞 {seller.seller_contact}
                                      </p>
                                    </div>
                                  )}
                                  {seller.seller_email && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Email
                                      </p>
                                      <p className="text-gray-900 font-medium break-all">
                                        ✉️ {seller.seller_email}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="flex flex-col gap-4 sm:gap-6 w-full lg:w-auto lg:min-w-[280px]">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
                                <h3 className="text-sm font-bold mb-4 text-gray-800 flex items-center gap-2">
                                  <span>📊</span> Government Price Estimation
                                </h3>
                                <div className="flex flex-col gap-3">
                                  <input
                                    type="number"
                                    placeholder="Enter area size (sq ft)"
                                    value={areaSize}
                                    onChange={(e) => setAreaSize(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-900 focus:border-transparent w-full"
                                  />
                                  <button
                                    onClick={handleGovtPriceEstimate}
                                    className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-blue-900 text-white hover:bg-blue-800 active:bg-blue-900 transition-all shadow-md hover:shadow-lg whitespace-nowrap w-full"
                                  >
                                    Get Estimate
                                  </button>
                                </div>
                                {govtEstimatedPrice && (
                                  <p className="mt-4 text-emerald-700 text-sm font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                                    ✓ Estimated Value: ₹
                                    {govtEstimatedPrice.toLocaleString()}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                  Buyer Action
                                </label>
                                <select
                                  value={status}
                                  disabled={isDiscarded}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    setStatusMap((p) => ({
                                      ...p,
                                      [seller.id]: newStatus,
                                    }));

                                    const raw = localStorage.getItem("loggedUser");
                                    if (!raw) return;
                                    const user = JSON.parse(raw);
                                    const tenantId =
                                      user.tenant_id ?? user.tenantId;

                                    const res = await fetch(
                                      `/api/buyers/${buyerId}/property-status`,
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          "x-tenant-id": String(tenantId),
                                        },
                                        body: JSON.stringify({
                                          sellerId: seller.id,
                                          status: newStatus,
                                        }),
                                      }
                                    );

                                    if (res.ok) {
                                      const data = await res.json();
                                      if (data?.buyerStatus) {
                                        setBuyer((prev: any) => ({
                                          ...prev,
                                          status: data.buyerStatus,
                                        }));
                                      }
                                    }
                                  }}
                                  className={`border border-blue-300 rounded-lg px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-900 focus:border-transparent w-full ${isDiscarded
                                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                      : "bg-white text-gray-900 hover:bg-blue-50"
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
              <div className="space-y-6 sm:space-y-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Internal Remarks
                </h3>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Add New Remark
                  </label>
                  <textarea
                    value={latestRemark}
                    onChange={(e) => setLatestRemark(e.target.value)}
                    rows={4}
                    className="w-full border-2 border-blue-200 rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm font-medium focus:ring-2 focus:ring-blue-900 focus:border-blue-900 resize-none bg-blue-50 placeholder-gray-400"
                    placeholder="Write your internal notes and observations here..."
                  />
                </div>

                <button
                  disabled={savingRemark}
                  onClick={saveRemark}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-lg bg-blue-900 text-white hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {savingRemark ? "💾 Saving..." : "✓ Save Remark"}
                </button>

                {remarksHistory.length > 0 && (
                  <div className="mt-6 sm:mt-8 space-y-4">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800">
                      Remark History ({remarksHistory.length})
                    </h4>

                    <div className="space-y-3">
                      {remarksHistory.map((r, idx) => (
                        <div
                          key={r.id}
                          className="relative border-l-4 border-blue-900 bg-gradient-to-r from-blue-50 to-white p-4 sm:p-5 rounded-r-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full bg-blue-900 border-2 border-white"></div>
                          <p className="text-sm text-gray-800 font-medium leading-relaxed">
                            {r.remark}
                          </p>
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
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Follow-ups
                  </h3>
                  <button
                    onClick={() => setShowFollowUpModal(true)}
                    className="w-full sm:w-auto text-sm px-4 py-2 bg-blue-900 text-white rounded-lg font-medium shadow hover:bg-blue-800 active:bg-blue-900 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    + Schedule Follow-up
                  </button>
                </div>
                <FollowUpList buyerId={buyerId} />
              </div>
            )}

            {/* ACTIVITY TIMELINE TAB */}
            {activeTab === "activity" && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Activity Timeline
                </h3>

                {activityLogs.length === 0 ? (
                  <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-xl p-6 sm:p-8 text-center border border-dashed border-blue-200">
                    <div className="text-blue-300 text-3xl mb-3">📋</div>
                    <p className="text-gray-600 font-semibold text-base sm:text-lg">
                      No activity yet
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Activity will appear here as interactions occur
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {activityLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="relative border-l-4 border-blue-900 bg-gradient-to-r from-blue-50 to-white p-4 sm:p-5 rounded-r-xl shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full bg-blue-900 border-2 border-white"></div>
                        <div className="text-sm text-gray-800 font-semibold">
                          {log.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 font-medium">
                          <span className="font-semibold">
                            by {log.performed_by_name ?? "System"}
                          </span>
                          {log.performed_by_role && (
                            <span className="ml-1 text-gray-400">
                              ({log.performed_by_role})
                            </span>
                          )}
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
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md space-y-6 shadow-2xl border border-blue-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
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
                  className="w-full text-sm file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-100 file:text-blue-900 hover:file:bg-blue-200 file:cursor-pointer"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 active:bg-blue-900 font-semibold transition-all shadow-md hover:shadow-lg"
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
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md space-y-6 shadow-2xl border border-blue-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  📅 Add Follow-up
                </h3>
                <button
                  onClick={() => setShowFollowUpModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
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
    <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-4 sm:p-5 hover:shadow-xl transition-shadow">
      <p className="text-[11px] font-bold text-blue-900 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">
        {value}
      </p>
    </div>
  );
}