"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import FollowUpForm from "@/components/follow-ups/FollowUpForm";
import FollowUpList from "@/components/follow-ups/FollowUpList";
import DocumentSection from "@/components/DocumentSection";
import dynamic from "next/dynamic";

type Seller = {
  id: number;
  name: string;
  owner_name: string;
  property_type: string;
  price: number;
  bedrooms: number;
  email?: string;
  owner_contact?: string;
  status: string;
  remarks?: string;
  location?: string;
  lat?: number;
  lng?: number;
  tenant_id?: number;
};

const LOAN_CARD_STYLE: Record<string, string> = {
  INQUIRY: "border-gray-300 bg-gray-50",
  PROCESSING: "border-blue-900 bg-blue-50",
  DOCUMENTS_PENDING: "border-yellow-300 bg-yellow-50",
  APPROVED: "border-green-300 bg-green-50",
  REJECTED: "border-red-300 bg-red-50",
};

export default function SellerDetailPage() {
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [latestRemark, setLatestRemark] = useState("");
  const [remarksHistory, setRemarksHistory] = useState<any[]>([]);
  const [savingRemark, setSavingRemark] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<any[]>([]);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState<any>(null);
  const [loanType, setLoanType] = useState("HOME_LOAN");
  const [bankName, setBankName] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenureYears, setTenureYears] = useState("");
  const [loanRemarks, setLoanRemarks] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoanId, setUploadLoanId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const loanFileInputRef = useRef<HTMLInputElement | null>(null);
  const [sellerFollowUps, setSellerFollowUps] = useState<any[]>([]);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [activeTab, setActiveTab] = useState("buyers");
  const [shareLink, setShareLink] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);

  const STATUS_OPTIONS = ["New", "Contacted", "Site Visit Done", "Dropped"];

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/');
    const idFromUrl = Number(pathSegments[pathSegments.length - 1]);

    if (!isNaN(idFromUrl) && idFromUrl > 0) {
      setSellerId(idFromUrl);
    } else {
      console.error('Invalid seller ID in URL');
      setLoading(false);
    }
  }, []);

  const fetchLoans = async () => {
    if (!sellerId) return;
    const res = await fetch(`/api/loans?sellerId=${sellerId}`);
    const data = await res.json();
    setLoans(data || []);
  };

  async function fetchSellerFollowUps() {
    if (!sellerId) return;
    const res = await fetch(`/api/follow-ups?sellerId=${sellerId}`);
    if (res.ok) {
      setSellerFollowUps(await res.json());
    }
  }

  async function markSellerFollowUpDone(id: number) {
    await fetch(`/api/follow-ups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    setSellerFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, status: "DONE" } : f)));
  }

  async function uploadPhotos() {
    if (!selectedFiles || selectedFiles.length === 0 || !sellerId) return;
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => formData.append("photos", file));
    const res = await fetch(`/api/sellers/${sellerId}/photos`, { method: "POST", body: formData });
    if (res.ok) {
      const photosRes = await fetch(`/api/sellers/${sellerId}/photos`);
      if (photosRes.ok) {
        const data = await photosRes.json();
        setPhotos(data || []);
      }
      setSelectedFiles(null);
    }
  }

  async function fetchActivityLogs(tenantId: number) {
    if (!sellerId) return;
    const res = await fetch(`/api/activity-logs?tenantId=${tenantId}&entityType=seller&entityId=${sellerId}`);
    if (res.ok) {
      setActivityLogs(await res.json());
    }
  }

  async function fetchRemarks() {
    if (!sellerId) return;
    const res = await fetch(`/api/internal-remarks?entityType=seller&entityId=${sellerId}`);
    if (!res.ok) return;
    const data = await res.json();
    setRemarksHistory(data);
    setLatestRemark(data[0]?.remark || "");
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
        entityType: "seller",
        entityId: sellerId,
        remark: latestRemark,
        createdBy: user.id,
      }),
    });
    setSavingRemark(false);
    fetchRemarks();
  }

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;
    const user = JSON.parse(raw);
    setTenantId(user.tenant_id ?? user.tenantId);
  }, []);

  useEffect(() => {
    if (!sellerId || !tenantId) return;
    async function loadData() {
      try {
        const sellerRes = await fetch(`/api/sellers/${sellerId}`);
        if (sellerRes.ok) {
          const data = await sellerRes.json();
          setSeller(data);
          await fetchRemarks();
        }
        const buyersRes = await fetch(`/api/sellers/${sellerId}/buyer-status`, {
          headers: { "x-tenant-id": String(tenantId) },
        });
        if (buyersRes.ok) {
          const data = await buyersRes.json();
          setBuyers(data.buyers || []);
        }
        const photosRes = await fetch(`/api/sellers/${sellerId}/photos`);
        if (photosRes.ok) {
          const data = await photosRes.json();
          setPhotos(data || []);
        }
        if (tenantId) {
          await fetchActivityLogs(tenantId);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sellerId, tenantId]);

  useEffect(() => {
    if (sellerId) {
      fetchLoans();
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId) {
      fetchSellerFollowUps();
    }
  }, [sellerId]);

  function statusBadge(status: string) {
    switch (status) {
      case "Site Visit Done":
        return "bg-green-100 text-green-700";
      case "Contacted":
        return "bg-blue-100 text-blue-900";
      case "Dropped":
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

  if (!seller) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Seller not found</div>
      </div>
    );
  }

  const tabs = [
    { id: "buyers", label: "Matched Buyers" },
    { id: "remarks", label: "Internal Remarks" },
    { id: "loans", label: "Loan Details" },
    { id: "documents", label: "Documents" },
    { id: "photos", label: "Property Photos" },
    { id: "followups", label: "Follow-ups" },
    { id: "activity", label: "Activity Timeline" },
    { id: "overview", label: "About" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full px-4 lg:px-6 pt-4 pb-8 space-y-6">


        {/* HEADER CARD - PREMIUM DESIGN */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-blue-100 p-4">

          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-blue-50 to-transparent rounded-full -mr-20 -mt-20 opacity-60"></div>

          <div className="relative flex justify-between items-start gap-6">
            <div className="flex gap-6 flex-1">
              <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-base shadow flex-shrink-0">

                {(seller.owner_name || seller.name)?.[0]?.toUpperCase() || "S"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {seller.property_type || "Property"}
                  </h1>

                  <span className={`px-2.5 py-0.5 text-[11px] rounded-full font-medium ${statusBadge(seller.status)}`}>
                    {seller.status}
                  </span>

                </div>
                <div className="flex flex-wrap gap-6 mt-3">

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-lg">👤</span>
                    <span className="font-medium">{seller.owner_name || seller.name}</span>
                  </div>
                  {seller.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-lg">✉️</span>
                      <span className="font-medium">{seller.email}</span>
                    </div>
                  )}
                  {seller.owner_contact && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-lg">📞</span>
                      <span className="font-medium">{seller.owner_contact}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowFollowUpModal(true)}
                className="px-6 py-3 text-sm font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-900 active:bg-blue-900 transition-all shadow-md hover:shadow-lg"
              >
                + Follow-up
              </button>
              <button
                onClick={async () => {
                  const res = await fetch(`/api/sellers/${sellerId}/share`, {
                    method: "POST",
                    headers: {
                      "x-user": localStorage.getItem("loggedUser")!,
                    },
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    alert(data.error || "Failed");
                    return;
                  }
                  setShareLink(data.shareUrl);
                  setShowToast(true);
                  setCopied(false);
                }}
                className="px-6 py-3 text-sm font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-900 active:bg-blue-900 transition-all shadow-md hover:shadow-lg"
              >
                🔗 Share
              </button>
            </div>
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {showToast && (
          <div className="fixed top-5 right-5 z-[9999] w-[420px] bg-white border border-blue-200 shadow-2xl rounded-2xl p-6 animate-slide-in">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-gray-900">Share Property Link</span>
              <button
                onClick={() => setShowToast(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2.5 border-2 border-blue-200 rounded-lg text-sm font-medium bg-blue-50"
              />
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(shareLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-5 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition-all shadow-md"
              >
                Copy
              </button>
            </div>
            {copied && (
              <div className="mt-3 text-emerald-600 text-sm font-semibold">
                ✓ Link copied to clipboard
              </div>
            )}
          </div>
        )}

        {/* KEY INFO CARDS - MODERN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard label="Price" value={`₹${seller.price}`} />
          <InfoCard label="Bedrooms" value={`${seller.bedrooms} BHK`} />
          <InfoCard label="Contact" value={seller.owner_contact || "—"} />
          <InfoCard label="Status" value={seller.status} />
        </div>

        {/* TABBED CARD - PREMIUM DESIGN */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* TAB HEADERS */}
          <div className="flex border-b border-gray-200 overflow-x-auto bg-gradient-to-r from-gray-50 to-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 font-medium text-sm whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
                    ? "border-blue-900 text-blue-900 bg-blue-50/30"
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Seller Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Seller Name</p>
                    <p className="text-gray-900 font-semibold text-sm">{seller.owner_name || seller.name || "—"}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Property Type</p>
                    <p className="text-gray-900 font-semibold text-sm">{seller.property_type}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Price</p>
                    <p className="text-gray-900 font-semibold text-sm">₹{seller.price}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Bedrooms</p>
                    <p className="text-gray-900 font-semibold text-sm">{seller.bedrooms} BHK</p>
                  </div>
                  {seller.location && (
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100 col-span-full">
                      <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Location</p>
                      <p className="text-gray-900 font-semibold text-sm">{seller.location}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MATCHED BUYERS TAB */}
            {activeTab === "buyers" && (
              <div className="space-y-6">
                {buyers.length === 0 ? (
                  <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-xl p-8 text-center border border-dashed border-blue-200">

                    <div className="text-blue-900 text-6xl mb-4">👥</div>
                    <p className="text-gray-600 font-semibold text-lg">No matched buyers yet</p>
                    <p className="text-gray-500 text-sm mt-2">Buyers will appear here as they match property criteria</p>
                  </div>
                ) : (
                  buyers.map((buyer) => {
                    const status = buyer.status || "New";
                    const isDropped = status === "Dropped";
                    return (
                      <div
                        key={buyer.buyer_id}
                        className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border transition-all ${isDropped
                            ? "opacity-60 border-gray-300"
                            : "border-blue-200 hover:shadow-xl hover:border-blue-300"
                          }`}
                        style={{
                          borderLeft: isDropped ? undefined : "5px solid #2563eb"
                        }}
                      >
                        <div className="p-6">
                          <div className="flex justify-between gap-6 flex-wrap">
                            <div className="space-y-3 flex-1 min-w-[300px]">
                              <div className="mb-3">
                                <p className="font-bold text-gray-900 text-xl">{buyer.name}</p>
                                <p className="text-gray-600 text-sm mt-1">{buyer.email} • {buyer.phone}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">Budget Range</p>
                                  <p className="text-gray-900 font-medium">₹{buyer.budget_min} – ₹{buyer.budget_max}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">Buyer–Property Status</p>
                                  <p className="text-gray-900 font-medium">{status}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Seller Action</label>
                              <select
                                value={status}
                                disabled={isDropped}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  await fetch(`/api/buyers/${buyer.buyer_id}/property-status`, {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      "x-tenant-id": String(tenantId),
                                    },
                                    body: JSON.stringify({ sellerId, status: newStatus }),
                                  });
                                  const buyersRes = await fetch(
                                    `/api/sellers/${sellerId}/buyer-status`,
                                    { headers: { "x-tenant-id": String(tenantId) } }
                                  );
                                  if (buyersRes.ok) {
                                    const data = await buyersRes.json();
                                    setBuyers(data.buyers || []);
                                  }
                                }}
                                className={`border border-blue-900 rounded-lg px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-900 focus:border-transparent ${isDropped ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white text-gray-900 hover:bg-blue-50"
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
                    );
                  })
                )}
              </div>
            )}

            {/* INTERNAL REMARKS TAB */}
            {activeTab === "remarks" && (
              <div className="space-y-8">
                <h3 className="text-lg font-semibold text-gray-900">
                  Internal Remarks</h3>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Add New Remark</label>
                  <textarea
                    value={latestRemark}
                    onChange={(e) => setLatestRemark(e.target.value)}
                    rows={4}
                    className="w-full border-2 border-blue-200 rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-900 focus:border-blue-900 resize-none bg-blue-50 placeholder-gray-400"
                    placeholder="Write your internal notes and observations here..."
                  />
                </div>
                <button
                  disabled={savingRemark}
                  onClick={saveRemark}
                  className="px-6 py-3 text-sm font-semibold rounded-lg bg-blue-900 text-white hover:bg-blue-900 active:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {savingRemark ? "💾 Saving..." : "✓ Save Remark"}
                </button>
                {remarksHistory.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">Remark History ({remarksHistory.length})</h4>
                    <div className="space-y-3">
                      {remarksHistory.map((r, idx) => (
                        <div
                          key={r.id}
                          className="relative border-l-4 border-blue-900 bg-gradient-to-r from-blue-50 to-white p-5 rounded-r-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full bg-blue-900 border-2 border-white"></div>
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

            {/* LOAN DETAILS TAB */}
            {activeTab === "loans" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Loan Details</h3>
                  <button
                    onClick={() => setShowLoanModal(true)}
                    className="text-sm px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-900 active:bg-blue-900 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    + Add Loan
                  </button>
                </div>
                {loans.length === 0 ? (
                  <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-xl p-8 text-center border border-dashed border-blue-200">

                    <div className="text-blue-300 text-6xl mb-4">💰</div>
                    <p className="text-gray-600 font-semibold text-lg">No loans added yet</p>
                    <p className="text-gray-500 text-sm mt-2">Add loan details to track financing progress</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loans.map((loan: any) => (
                      <div
                        key={loan.id}
                        className={`border-2 rounded-xl p-5 space-y-3 transition-shadow hover:shadow-md ${LOAN_CARD_STYLE[loan.status?.toUpperCase()] || "border-gray-300"}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-base font-bold text-gray-900">{loan.loan_type.replace("_", " ")}</h3>
                            <p className="text-sm text-gray-600 mt-1">Bank: {loan.bank_name || "—"}</p>
                          </div>
                          <select
                            value={loan.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              await fetch(`/api/loans/${loan.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: newStatus }),
                              });
                              setLoans((prev) =>
                                prev.map((l) =>
                                  l.id === loan.id ? { ...l, status: newStatus } : l
                                )
                              );
                            }}
                            className="text-sm border-2 border-gray-300 rounded-lg px-3 py-2 bg-white font-semibold focus:ring-2 focus:ring-blue-900"
                          >
                            <option value="INQUIRY">Inquiry</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="DOCUMENTS_PENDING">Documents Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-sm text-gray-700 font-medium">
                            ₹{loan.loan_amount?.toLocaleString()} • {loan.interest_rate || "—"}% • {loan.tenure_years || "—"} yrs
                          </p>
                        </div>
                        <div className="text-sm space-y-2 pt-2 border-t border-gray-200">
                          <p className="font-semibold text-gray-700">Documents:</p>
                          {loan.documents && loan.documents.length > 0 ? (
                            <ul className="space-y-1.5">
                              {loan.documents.map((doc: any) => (
                                <li key={doc.id} className="flex items-center gap-2">
                                  <span className="text-blue-900">📄</span>
                                  <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-900 underline hover:text-blue-900 font-medium">
                                    {doc.file_name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400 text-sm">No documents uploaded</p>
                          )}
                          <button
                            onClick={() => {
                              setUploadLoanId(loan.id);
                              loanFileInputRef.current?.click();
                            }}
                            className="text-blue-900 underline font-semibold hover:text-blue-900 text-sm"
                          >
                            + Upload Document
                          </button>
                        </div>
                        <div className="flex gap-4 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setEditingLoan(loan);
                              setLoanType(loan.loan_type);
                              setBankName(loan.bank_name || "");
                              setLoanAmount(String(loan.loan_amount || ""));
                              setInterestRate(loan.interest_rate !== null ? String(loan.interest_rate) : "");
                              setTenureYears(loan.tenure_years !== null ? String(loan.tenure_years) : "");
                              setLoanRemarks(loan.remarks || "");
                              setShowLoanModal(true);
                            }}
                            className="text-sm font-semibold text-blue-900 hover:text-blue-900"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={async () => {
                              await fetch(`/api/loans/${loan.id}`, { method: "DELETE" });
                              setLoans((prev) => prev.filter((l) => l.id !== loan.id));
                            }}
                            className="text-sm font-semibold text-red-600 hover:text-red-700"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === "documents" && sellerId && (
              <div>
                <DocumentSection entityType="seller" entityId={sellerId} />
              </div>
            )}

            {/* PROPERTY PHOTOS TAB */}
            {activeTab === "photos" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Property Photos</h3>
                <div
                  className="border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-900 hover:bg-blue-50/30 transition-all bg-gradient-to-b from-blue-50 to-white"
                  onClick={() => document.getElementById("photoUploadInput")?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setSelectedFiles(e.dataTransfer.files);
                  }}
                >
                  <div className="text-6xl mb-4 text-blue-900">📷</div>
                  <p className="text-gray-700 font-semibold text-lg">Drag & drop property photos here</p>
                  <p className="text-sm text-gray-500 mt-2">or click to browse</p>
                  <input
                    id="photoUploadInput"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => setSelectedFiles(e.target.files)}
                  />
                </div>
                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-gray-700 font-semibold">
                      {selectedFiles.length} file(s) selected
                    </p>
                    <button
                      onClick={uploadPhotos}
                      className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-blue-900 text-white hover:bg-blue-900 active:bg-blue-900 transition-all shadow-md"
                    >
                      Upload Photos
                    </button>
                  </div>
                )}
                {photos.length === 0 ? (
                  <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-xl p-8 text-center border border-dashed border-blue-200">

                    <div className="text-blue-300 text-3xl mb-3">📷</div>

                    <p className="text-gray-600 font-semibold text-lg">No photos uploaded yet</p>
                    <p className="text-gray-500 text-sm mt-2">Upload property photos to showcase the listing</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo: any) => (
                      <img
                        key={photo.id}
                        src={photo.photo_url}
                        alt="Property"
                        className="h-48 w-full object-cover rounded-xl border-2 border-gray-200 hover:border-blue-900 transition-all shadow-sm hover:shadow-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FOLLOW-UPS TAB */}
            {activeTab === "followups" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Follow-ups</h3>
                  <button
                    onClick={() => setShowFollowUpModal(true)}
                    className="text-sm px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-900 active:bg-blue-900 transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    + Schedule Follow-up
                  </button>
                </div>
                {sellerFollowUps.length === 0 ? (
                  <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-xl p-8 text-center border border-dashed border-blue-200">

                    <div className="text-blue-300 text-6xl mb-4">📅</div>
                    <p className="text-gray-600 font-semibold text-lg">No follow-ups yet</p>
                    <p className="text-gray-500 text-sm mt-2">Schedule follow-ups to stay on track</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sellerFollowUps.map((fu) => (
                      <div key={fu.id} className="flex justify-between items-center border-2 border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-semibold">
                              {fu.follow_up_type}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {new Date(fu.follow_up_date).toDateString()}
                            </span>
                          </div>
                          {fu.note && <p className="text-sm text-gray-600 mt-2">{fu.note}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs px-4 py-1.5 rounded-full font-semibold ${fu.status === "DONE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {fu.status}
                          </span>
                          {fu.status === "PENDING" && (
                            <button
                              onClick={() => markSellerFollowUpDone(fu.id)}
                              className="text-sm text-blue-900 hover:text-blue-900 font-semibold hover:underline"
                            >
                              ✔ Mark Done
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITY TIMELINE TAB */}
            {activeTab === "activity" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Activity Timeline</h3>
                {activityLogs.length === 0 ? (
                  <div className="bg-gradient-to-b from-blue-50 to-gray-50 rounded-xl p-8 text-center border border-dashed border-blue-200">

                    <div className="text-blue-300 text-6xl mb-4">📋</div>
                    <p className="text-gray-600 font-semibold text-lg">No activity yet</p>
                    <p className="text-gray-500 text-sm mt-2">Activity will appear here as interactions occur</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log, idx) => (
                      <div key={idx} className="relative border-l-4 border-blue-900 bg-gradient-to-r from-blue-50 to-white p-5 rounded-r-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute -left-1.5 top-5 w-3 h-3 rounded-full bg-blue-900 border-2 border-white"></div>
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

        {/* LOAN MODAL */}
        {showLoanModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-6 shadow-2xl border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingLoan ? "Edit Loan" : "Add Loan"}
              </h3>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-900"
              >
                <option value="HOME_LOAN">Home Loan</option>
                <option value="BALANCE_TRANSFER">Balance Transfer</option>
              </select>
              <input
                placeholder="Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-900"
              />
              <input
                type="number"
                placeholder="Loan Amount"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-900"
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Interest Rate %"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-900"
                />
                <input
                  type="number"
                  placeholder="Tenure (Years)"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Internal remarks"
                value={loanRemarks}
                onChange={(e) => setLoanRemarks(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-900"
              />
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowLoanModal(false);
                    setEditingLoan(null);
                  }}
                  className="px-5 py-2.5 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-900 active:bg-blue-900 font-semibold transition-all shadow-md hover:shadow-lg"
                  onClick={async () => {
                    const payload = {
                      loan_type: loanType,
                      bank_name: bankName,
                      loan_amount: Number(loanAmount),
                      interest_rate: interestRate ? Number(interestRate) : null,
                      tenure_years: tenureYears ? Number(tenureYears) : null,
                      remarks: loanRemarks,
                    };
                    if (editingLoan) {
                      await fetch(`/api/loans/${editingLoan.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      });
                    } else {
                      await fetch("/api/loans", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ...payload,
                          tenant_id: tenantId,
                          seller_id: sellerId,
                        }),
                      });
                    }
                    setShowLoanModal(false);
                    setEditingLoan(null);
                    fetchLoans();
                  }}
                >
                  Save Loan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FILE INPUT FOR LOANS */}
        <input
          type="file"
          ref={loanFileInputRef}
          className="hidden"
          onChange={async (e) => {
            if (!e.target.files || e.target.files.length === 0) return;
            if (!uploadLoanId) return;
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append("file", file);
            await fetch(`/api/loans/${uploadLoanId}/documents`, {
              method: "POST",
              body: formData,
            });
            e.target.value = "";
            setUploadLoanId(null);
            fetchLoans();
          }}
        />

        {/* FOLLOW-UP MODAL */}
        {showFollowUpModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-6 shadow-2xl border border-blue-100">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">📅 Add Follow-up</h3>
                <button
                  onClick={() => setShowFollowUpModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
              <FollowUpForm
                tenantId={tenantId!}
                sellerId={sellerId!}
                agentId={JSON.parse(localStorage.getItem("loggedUser")!).id}
                onSuccess={() => {
                  setShowFollowUpModal(false);
                  fetchSellerFollowUps();
                }}
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
      <p className="text-[11px] font-bold text-blue-900 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-base font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
}