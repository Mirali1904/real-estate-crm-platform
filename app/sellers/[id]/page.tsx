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
  PROCESSING: "border-blue-300 bg-blue-50",
  DOCUMENTS_PENDING: "border-yellow-300 bg-yellow-50",
  APPROVED: "border-green-300 bg-green-50",
  REJECTED: "border-red-300 bg-red-50",
};

export default function SellerDetailPage() {
  // ✅ DYNAMIC SELLER ID - URL se lena (Next.js useParams jaisa)
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


  const STATUS_OPTIONS = ["New", "Contacted", "Site Visit Done", "Dropped"];

  // ✅ URL se seller ID extract karna
  useEffect(() => {
    // Browser URL se ID nikalna (e.g., /sellers/131)
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

  const res = await fetch(
    `/api/internal-remarks?entityType=seller&entityId=${sellerId}`
  );
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
        return "bg-blue-100 text-blue-700";
      case "Dropped":
        return "bg-gray-200 text-gray-500";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  if (loading) return <div className="px-6 pt-4">Loading...</div>;
  if (!seller) return <div className="px-6 pt-4">Seller not found</div>;

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
    <div className="w-full px-6 pt-2 space-y-6">
      

      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl shadow-sm p-6 border border-blue-100">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
              {(seller.owner_name || seller.name)?.[0]?.toUpperCase() || "S"}

            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{seller.property_type || "Property"}</h1>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusBadge(seller.status)}`}>
                  {seller.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3">
  <p className="text-sm text-gray-600 flex items-center gap-2">
    👤 Seller: {seller.owner_name || seller.name}
  </p>

  {seller.email && (
    <p className="text-sm text-gray-600 flex items-center gap-2">
      ✉️ {seller.email}
    </p>
  )}

  {seller.owner_contact && (
    <p className="text-sm text-gray-600 flex items-center gap-2">
      📞 {seller.owner_contact}
    </p>
  )}
</div>

            </div>
          </div>
          <button
            onClick={() => setShowFollowUpModal(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Follow-up
          </button>
        </div>
      </div>

      {/* KEY INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Info label="Price" value={`₹${seller.price}`} />
        <Info label="Bedrooms" value={`${seller.bedrooms} BHK`} />
        <Info label="Contact" value={seller.owner_contact || "-"} />
        <Info label="Status" value={seller.status} />
      </div>

      {/* TABBED CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* TAB HEADERS */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="p-6">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Seller Name</p>
                  <p className="text-gray-900 font-medium">
  {seller.owner_name || seller.name || "-"}
</p>

                </div>
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="text-gray-900 font-medium">{seller.property_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-gray-900 font-medium">₹{seller.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="text-gray-900 font-medium">{seller.bedrooms} BHK</p>
                </div>
                {seller.location && (
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-900 font-medium">{seller.location}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MATCHED BUYERS TAB */}
          {activeTab === "buyers" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-4">Matched Buyers</h3>
              {buyers.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 text-5xl mb-3">👥</div>
                  <p className="text-gray-500 font-medium">No matched buyers yet</p>
                </div>
              ) : (
                buyers.map((buyer) => {
                  const status = buyer.status || "New";
                  const isDropped = status === "Dropped";
                  return (
                    <div
                      key={buyer.buyer_id}
                      className={`bg-white border-2 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow ${
                        isDropped ? "opacity-50 border-gray-200" : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between gap-6">
                        <div className="space-y-2 flex-1">
                          <p className="font-semibold text-gray-900 text-lg">{buyer.name}</p>
                          <p className="text-gray-600">{buyer.email} • {buyer.phone}</p>
                          <p className="text-sm text-gray-700">Budget: ₹{buyer.budget_min} – ₹{buyer.budget_max}</p>
                          <p className="text-xs text-gray-500">
  <span className="font-medium">Buyer–Property Status:</span> {status}
</p>

                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1 font-medium">Seller Action</label>
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

// 🔥 re-fetch from DB (single source of truth)
const buyersRes = await fetch(
  `/api/sellers/${sellerId}/buyer-status`,
  { headers: { "x-tenant-id": String(tenantId) } }
);

if (buyersRes.ok) {
  const data = await buyersRes.json();
  setBuyers(data.buyers || []);
}

                              
                              await fetch(`/api/buyers/${buyer.buyer_id}/property-status`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", "x-tenant-id": String(tenantId) },
                                body: JSON.stringify({ sellerId, status: newStatus }),
                              });
                            }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt}>{opt}</option>
                            ))}
                          </select>
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
  <div className="space-y-6">
    <h3 className="font-semibold text-gray-900 text-lg">
      Internal Remarks
    </h3>

    {/* Latest Remark */}
    <textarea
      value={latestRemark}
      onChange={(e) => setLatestRemark(e.target.value)}
      rows={4}
      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm
                 focus:ring-2 focus:ring-blue-500"
      placeholder="Add new internal remark..."
    />

    <button
      disabled={savingRemark}
      onClick={saveRemark}
      className="px-5 py-2.5 text-sm rounded-lg bg-blue-600 text-white
                 hover:bg-blue-700 disabled:opacity-50"
    >
      {savingRemark ? "Saving..." : "Save Remark"}
    </button>

    {/* History */}
    {remarksHistory.length > 1 && (
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-semibold text-gray-600">
          Previous Remarks
        </h4>

        {remarksHistory.slice(1).map((r) => (
          <div
            key={r.id}
            className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r-lg"
          >
            <p className="text-sm text-gray-800">{r.remark}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(r.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
)}


          {/* LOAN DETAILS TAB */}
          {activeTab === "loans" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 text-lg">Loan Details</h3>
                <button
                  onClick={() => setShowLoanModal(true)}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Loan
                </button>
              </div>
              {loans.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 text-5xl mb-3">💰</div>
                  <p className="text-gray-500 font-medium">No loans added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loans.map((loan: any) => (
                    <div
                      key={loan.id}
                      className={`border-2 rounded-lg p-4 space-y-2 ${LOAN_CARD_STYLE[loan.status?.toUpperCase()] || "border-gray-300"}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-semibold">{loan.loan_type.replace("_", " ")}</h3>
                          <p className="text-xs text-gray-500">Bank: {loan.bank_name || "-"}</p>
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


                          className="text-xs border rounded px-2 py-1 bg-white"
                        >
                          <option value="INQUIRY">Inquiry</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="DOCUMENTS_PENDING">Documents Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-700">
                        ₹{loan.loan_amount} • {loan.interest_rate || "-"}% • {loan.tenure_years || "-"} yrs
                      </p>
                      <div className="text-xs text-gray-500 space-y-1 mt-2">
                        <p className="font-medium">Documents:</p>
                        {loan.documents && loan.documents.length > 0 ? (
                          <ul className="space-y-1">
                            {loan.documents.map((doc: any) => (
                              <li key={doc.id} className="flex items-center gap-2">
                                📄
                                <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                  {doc.file_name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400">No documents</p>
                        )}
                        <button
                          onClick={() => {
                            setUploadLoanId(loan.id);
                            loanFileInputRef.current?.click();
                          }}
                          className="text-blue-600 underline"
                        >
                          Upload
                        </button>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-600 pt-1">
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
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={async () => {
                            await fetch(`/api/loans/${loan.id}`, { method: "DELETE" });
                            setLoans((prev) => prev.filter((l) => l.id !== loan.id));
                          }}
                          className="text-red-500"
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
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Property Photos</h3>
              <div className="mb-4 flex items-center gap-3">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="text-sm"
                />
                <button onClick={uploadPhotos} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  Upload Photos
                </button>
              </div>
              {photos.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 text-5xl mb-3">📷</div>
                  <p className="text-gray-500 font-medium">No photos uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo: any) => (
                    <img key={photo.id} src={photo.photo_url} alt="Property" className="h-32 w-full object-cover rounded-lg border" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FOLLOW-UPS TAB */}
          {activeTab === "followups" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 text-lg">Follow-ups</h3>
                <button
                  onClick={() => setShowFollowUpModal(true)}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Schedule Follow-up
                </button>
              </div>
              {sellerFollowUps.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 text-5xl mb-3">📅</div>
                  <p className="text-gray-500 font-medium">No follow-ups yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sellerFollowUps.map((fu) => (
                    <div key={fu.id} className="flex justify-between items-center border-2 rounded-lg p-4 border-gray-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{fu.follow_up_type}</span>
                          <span className="text-xs text-gray-500">{new Date(fu.follow_up_date).toDateString()}</span>
                        </div>
                        {fu.note && <p className="text-sm text-gray-600 mt-1">{fu.note}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            fu.status === "DONE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {fu.status}
                        </span>
                        {fu.status === "PENDING" && (
                          <button onClick={() => markSellerFollowUpDone(fu.id)} className="text-xs text-blue-600 hover:underline">
                            ✔ Mark as Done
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
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Activity Timeline</h3>
              {activityLogs.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 text-5xl mb-3">📋</div>
                  <p className="text-gray-500 font-medium">No activity yet</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {activityLogs.map((log, idx) => (
                    <li key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
                      <div className="text-sm text-gray-800 font-medium">{log.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        by {log.performed_by_name ?? "System"} {log.performed_by_role ? `(${log.performed_by_role})` : ""} •{" "}
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      

      

      {showLoanModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[420px] space-y-3">
            <h3 className="text-sm font-semibold">
              {editingLoan ? "Edit Loan" : "Add Loan"}
            </h3>

            <select
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="HOME_LOAN">Home Loan</option>
              <option value="BALANCE_TRANSFER">Balance Transfer</option>
            </select>

            <input
              placeholder="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />



            <input
              type="number"
              placeholder="Loan Amount"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Interest Rate %"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />

              <input
                type="number"
                placeholder="Tenure (Years)"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <textarea
              rows={2}
              placeholder="Internal remarks"
              value={loanRemarks}
              onChange={(e) => setLoanRemarks(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            {/* 🔥 SAVE BUTTON — YAHI TUMHARA CODE JAYEGA */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowLoanModal(false);
                  setEditingLoan(null);
                }}
                className="text-sm px-4 py-2"
              >
                Cancel
              </button>

              {/* 👇👇👇 EXACT YAHAN 👇👇👇 */}
              <button
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg"
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

      {/* ===== SELLER FOLLOW-UP MODAL ===== */}
{showFollowUpModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl w-[420px] p-6 relative">
      <button
        onClick={() => setShowFollowUpModal(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

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
  );
}

/* SMALL INFO CARD */

function Info({ label, value }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium mt-1">{value}</p>
    </div>
  );
}
