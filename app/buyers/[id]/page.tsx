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

const LOAN_CARD_STYLE: Record<string, string> = {
  INQUIRY: "border-gray-300 bg-gray-50",
  PROCESSING: "border-blue-300 bg-blue-50",
  DOCUMENTS_PENDING: "border-yellow-300 bg-yellow-50",
  APPROVED: "border-green-300 bg-green-50",
  REJECTED: "border-red-300 bg-red-50",
};

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
  const [editingLoan, setEditingLoan] = useState<any>(null);
  const [remarks, setRemarks] = useState("");
  const [savingRemarks, setSavingRemarks] = useState(false);
  const [areaSize, setAreaSize] = useState("");
  const [govtEstimatedPrice, setGovtEstimatedPrice] = useState<number | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanType, setLoanType] = useState("HOME_LOAN");
  const [bankName, setBankName] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenureYears, setTenureYears] = useState("");
  const [loanStatus, setLoanStatus] = useState("INQUIRY");
  const [loanRemarks, setLoanRemarks] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoanId, setUploadLoanId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const openUploadModal = (loanId: number) => {
    setUploadLoanId(loanId);
    setShowUploadModal(true);
    setUploadFile(null);
  };

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

  const fetchLoans = async () => {
    const res = await fetch(`/api/loans?buyerId=${buyerId}`);
    const data = await res.json();
    setLoans(data || []);
  };

  const deleteLoan = async (loanId: number) => {
    if (!confirm("Are you sure you want to delete this loan?")) return;
    await fetch(`/api/loans/${loanId}`, { method: "DELETE" });
    setLoans((prev) => prev.filter((loan) => loan.id !== loanId));
  };

  const openEditLoanModal = (loan: any) => {
    setEditingLoan(loan);
    setLoanType(loan.loan_type);
    setBankName(loan.bank_name || "");
    setLoanAmount(String(loan.loan_amount || ""));
    setInterestRate(loan.interest_rate !== null ? String(loan.interest_rate) : "");
    setTenureYears(loan.tenure_years !== null ? String(loan.tenure_years) : "");
    setLoanStatus(loan.status || "INQUIRY");
    setLoanRemarks(loan.remarks || "");
    setShowLoanModal(true);
  };

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
          setRemarks(data.remarks || "");
        }

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

  useEffect(() => {
    if (buyerId) {
      fetchLoans();
    }
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

  if (loading) return <div className="px-6 pt-4">Loading...</div>;
  if (!buyer) return <div className="px-6 pt-4">Buyer not found</div>;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "properties", label: "Matched Properties" },
    { id: "remarks", label: "Internal Remarks" },
    { id: "loans", label: "Loan Details" },
    { id: "documents", label: "Documents" },
    { id: "followups", label: "Follow-ups" },
    { id: "activity", label: "Activity Timeline" },
  ];

  return (
    <div className="w-full px-6 pt-2 space-y-6">
      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/buyers")}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to Buyers
      </button>

      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-sm p-6 border border-blue-100">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
              {buyer.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{buyer.name}</h1>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusBadge(buyer.status)}`}>
                  {buyer.status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  ✉️ {buyer.email}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  📞 {buyer.phone}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  📍 {buyer.radius_km} km radius
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowFollowUpModal(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Follow-up
          </button>
        </div>
      </div>

      {/* KEY INFO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Info label="Requirement" value={buyer.requirement} />
        <Info label="Budget Range" value={`₹${buyer.budget_min} – ₹${buyer.budget_max}`} />
        <Info label="Bedrooms" value={`${buyer.bedrooms} BHK`} />
        <Info label="Search Radius" value={`${buyer.radius_km} km`} />
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
                  ? "border-blue-600 text-blue-600"
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
              <h3 className="font-semibold text-gray-900 mb-3">Buyer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{buyer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">{buyer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-gray-900 font-medium">₹{buyer.budget_min} – ₹{buyer.budget_max}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requirement</p>
                  <p className="text-gray-900 font-medium">{buyer.requirement}</p>
                </div>
              </div>
            </div>
          )}

          {/* MATCHED PROPERTIES TAB */}
          {activeTab === "properties" && (
            <div className="space-y-4">
              {matches.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 text-5xl mb-3">🏠</div>
                  <p className="text-gray-500 font-medium">No matched properties yet</p>
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
                      className={`bg-white border-2 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow ${isDiscarded ? "opacity-50 border-gray-200" : "border-gray-200"}`}
                    >
                      <div className="flex justify-between gap-6">
                        <div className="space-y-3 flex-1">
                          <div className="flex gap-4">
                            <button
                              onClick={() => setOpenImages((prev) => ({ ...prev, [seller.id]: !prev[seller.id] }))}
                              className="text-xs text-blue-600 hover:text-blue-700 underline font-medium"
                            >
                              {openImages[seller.id] ? "Hide Images" : "Show Images"}
                            </button>
                            <button
                              onClick={() => setOpenMap((prev) => ({ ...prev, [seller.id]: !prev[seller.id] }))}
                              className="text-xs text-blue-600 hover:text-blue-700 underline font-medium"
                            >
                              {openMap[seller.id] ? "Hide Map" : "Show Map"}
                            </button>
                          </div>

                          {openImages[seller.id] && sellerPhotos[seller.id]?.length > 0 && (
                            <div className="space-y-2">
                              <img
                                src={sellerPhotos[seller.id][0].photo_url}
                                alt="property"
                                className="w-64 h-40 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <div className="flex gap-2">
                                {sellerPhotos[seller.id].slice(1, 4).map((p: any) => (
                                  <img
                                    key={p.id}
                                    src={p.photo_url}
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

                          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                            <h3 className="text-sm font-semibold mb-3 text-gray-800">Government Price Estimation</h3>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                placeholder="Enter area size (sq ft)"
                                value={areaSize}
                                onChange={(e) => setAreaSize(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-60 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                onClick={handleGovtPriceEstimate}
                                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                              >
                                Get Estimate
                              </button>
                            </div>
                            {govtEstimatedPrice && (
                              <p className="mt-3 text-green-700 text-sm font-semibold">
                                Estimated Value: ₹{govtEstimatedPrice.toLocaleString()}
                              </p>
                            )}
                          </div>

                          <div className="pt-2">
                            <p className="font-semibold text-gray-900 text-lg">{seller.property_type || "Property"}</p>
                            <p className="text-gray-600 font-medium">₹{seller.price} • {seller.bedrooms} BHK</p>
                            <p className="mt-2 text-sm">
                              <span className="font-medium text-gray-700">Seller:</span> {seller.seller_name}
                            </p>
                            {seller.seller_contact && <p className="text-xs text-gray-500">📞 {seller.seller_contact}</p>}
                            {seller.seller_email && <p className="text-xs text-gray-500">✉️ {seller.seller_email}</p>}
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1 font-medium">Buyer Action</label>
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
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Internal Remarks / Notes</h3>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add internal notes about this buyer..."
              />
              <button
                disabled={savingRemarks}
                onClick={async () => {
                  setSavingRemarks(true);
                  const raw = localStorage.getItem("loggedUser");
                  if (!raw) return;
                  const user = JSON.parse(raw);
                  await fetch(`/api/buyers/remarks`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      buyerId,
                      tenantId: user.tenant_id ?? user.tenantId,
                      remarks,
                      updatedBy: user.id,
                    }),
                  });
                  setBuyer((prev: any) => ({ ...prev, remarks }));
                  await fetchActivityLogs(user.tenant_id ?? user.tenantId);
                  setSavingRemarks(false);
                }}
                className="px-5 py-2.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {savingRemarks ? "Saving..." : "Save Remarks"}
              </button>
            </div>
          )}

          {/* LOAN DETAILS TAB */}
          {activeTab === "loans" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 text-lg">Loan Details</h3>
                <button
                  onClick={() => setShowLoanModal(true)}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                      className={`border-2 rounded-lg p-4 space-y-2 transition-all ${LOAN_CARD_STYLE[loan.status?.toUpperCase()] || "border-gray-300"}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{loan.loan_type.replace("_", " ")}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Bank: {loan.bank_name || "-"}</p>
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
                            setLoans((prev) => prev.map((l) => (l.id === loan.id ? { ...l, status: newStatus } : l)));
                          }}
                          className="text-xs border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="INQUIRY">Inquiry</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="DOCUMENTS_PENDING">Documents Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
                        ₹{loan.loan_amount.toLocaleString()} • {loan.interest_rate || "-"}% • {loan.tenure_years || "-"} yrs
                      </p>
                      {loan.remarks && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <b>Remarks:</b> {loan.remarks}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 space-y-2 pt-2 border-t border-gray-200">
                        <p className="font-semibold text-gray-700">Documents:</p>
                        {loan.documents && loan.documents.length > 0 ? (
                          <ul className="space-y-1.5">
                            {loan.documents.map((doc: any) => (
                              <li key={doc.id} className="flex items-center gap-2">
                                <span className="text-base">📄</span>
                                <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                                  {doc.file_name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400">No documents uploaded</p>
                        )}
                        <button onClick={() => openUploadModal(loan.id)} className="text-blue-600 hover:text-blue-700 underline font-medium">
                          + Upload Document
                        </button>
                      </div>
                      <div className="flex gap-4 text-xs pt-2 border-t border-gray-200">
                        <button onClick={() => openEditLoanModal(loan)} className="text-blue-600 hover:text-blue-700 font-medium">
                          ✏️ Edit
                        </button>
                        <button onClick={() => deleteLoan(loan.id)} className="text-red-600 hover:text-red-700 font-medium">
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
          {activeTab === "documents" && (
            <div>
              <DocumentSection entityType="buyer" entityId={buyerId} />
            </div>
          )}

          {/* FOLLOW-UPS TAB */}
          {activeTab === "followups" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 text-lg">Follow-ups</h3>
                <button
                  onClick={() => setShowFollowUpModal(true)}
                  className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  + Schedule Follow-up
                </button>
              </div>
              <FollowUpList buyerId={buyerId} />
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

      
      {/* MODALS */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[420px] space-y-3">
            <h3 className="text-sm font-semibold">{editingLoan ? "Edit Loan" : "Add Loan"}</h3>
            <select value={loanType} onChange={(e) => setLoanType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="HOME_LOAN">Home Loan</option>
              <option value="BALANCE_TRANSFER">Balance Transfer</option>
            </select>
            <input placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Loan Amount" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input type="number" placeholder="Interest Rate %" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input type="number" placeholder="Tenure (Years)" value={tenureYears} onChange={(e) => setTenureYears(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <textarea rows={2} placeholder="Internal remarks" value={loanRemarks} onChange={(e) => setLoanRemarks(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowLoanModal(false)} className="text-sm px-4 py-2">Cancel</button>
              <button
                className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg"
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
                        tenant_id: buyer.tenant_id,
                        buyer_id: buyer.id,
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

     {showUploadModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-[380px] space-y-5 shadow-xl border border-blue-100">
      
      <h3 className="text-base font-semibold text-blue-600">
        Upload Document
      </h3>

      <label className="block text-sm font-medium text-gray-600">
        Select file
      </label>

      <input
        type="file"
        accept=".pdf,.jpg,.png"
        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
        className="w-full text-sm file:mr-4 file:py-2 file:px-4
                   file:rounded-lg file:border-0
                   file:bg-indigo-50 file:text-blue-600
                   hover:file:bg-blue-100"
      />

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={() => setShowUploadModal(false)}
          className="text-sm px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            fetchLoans();
          }}
        >
          Upload
        </button>
      </div>
    </div>
  </div>
)}


      {showFollowUpModal && tenantId && agentId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[420px] space-y-5 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-blue-600">Add Follow-up</h3>
              <button onClick={() => setShowFollowUpModal(false)} className="text-gray-500 hover:text-black">
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
  );
}

function Info({ label, value }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}