  "use client";

  import { useEffect, useState } from "react";
  import { useParams } from "next/navigation";



  const LOAN_CARD_STYLE: Record<string, string> = {
    INQUIRY: "border-gray-300 bg-gray-50",
    PROCESSING: "border-blue-300 bg-blue-50",
    DOCUMENTS_PENDING: "border-yellow-300 bg-yellow-50",
    APPROVED: "border-green-300 bg-green-50",
    REJECTED: "border-red-300 bg-red-50",
  };



  export default function BuyerDetailPage() {
    const params = useParams();
    const buyerId = Number(params?.id);

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

    // ===== GOVT PRICE UI STATE =====
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

      await fetch(`/api/loans/${loanId}`, {
        method: "DELETE",
      });

      // UI se remove
      setLoans((prev) =>
        prev.filter((loan) => loan.id !== loanId)
      );
    };

    const openEditLoanModal = (loan: any) => {
      setEditingLoan(loan);

      setLoanType(loan.loan_type);
      setBankName(loan.bank_name || "");
      setLoanAmount(String(loan.loan_amount || ""));
      setInterestRate(
        loan.interest_rate !== null ? String(loan.interest_rate) : ""
      );
      setTenureYears(
        loan.tenure_years !== null ? String(loan.tenure_years) : ""
      );
      setLoanStatus(loan.status || "INQUIRY");
      setLoanRemarks(loan.remarks || "");

      setShowLoanModal(true);
    };



    async function fetchSellerPhotos(sellerId: number) {
      if (sellerPhotos[sellerId]) return;

      const res = await fetch(`/api/sellers/${sellerId}/photos`);
      if (!res.ok) return;

      const data = await res.json(); // 👈 data = ARRAY

      console.log("PHOTOS ARRAY 👉", data);

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

            sellers.forEach((s: any) => {
              console.log("MATCH SELLER OBJECT 👉", s);
              fetchSellerPhotos(s.id);
            });



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


    // ===== GOVT PRICE DUMMY CALCULATION =====
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

    return (
      <div className="w-full px-6 pt-2 space-y-6">

        {/* ===== BUYER HEADER CARD ===== */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
              {buyer.name[0].toUpperCase()}
            </div>

            <div>
              <h1 className="text-lg font-semibold">{buyer.name}</h1>
              <p className="text-sm text-gray-500">{buyer.email}</p>
              <p className="text-sm text-gray-500">{buyer.phone}</p>
            </div>
          </div>

          <span
            className={`h-fit px-3 py-1 text-xs rounded-full font-medium ${statusBadge(
              buyer.status
            )}`}
          >
            {buyer.status}
          </span>
        </div>

        {/* ===== BUYER META ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Info label="Requirement" value={buyer.requirement} />
          <Info
            label="Budget"
            value={`₹${buyer.budget_min} – ₹${buyer.budget_max}`}
          />
          <Info label="Bedrooms" value={buyer.bedrooms} />
          <Info label="Radius" value={`${buyer.radius_km} km`} />
        </div>

        {/* ===== BUYER REMARKS ===== */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-2 text-gray-700">
            Internal Remarks
          </h2>

          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="Add internal remarks about this buyer..."
          />

          <div className="flex justify-end mt-3">
            <button
              type="button"
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

                setBuyer((prev: any) => ({
                  ...prev,
                  remarks,
                }));

                await fetchActivityLogs(user.tenant_id ?? user.tenantId);

                setSavingRemarks(false);
              }}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save Remarks
            </button>
          </div>
        </div>

        {/* ===== BUYER LOANS ===== */}
        {/* ===== BUYER LOANS ===== */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-700">
              Loan Details
            </h2>

            <button
              onClick={() => setShowLoanModal(true)}
              className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              + Add Loan
            </button>
          </div>

          {loans.length === 0 ? (
            <p className="text-sm text-gray-500">
              No loans added yet
            </p>
          ) : (
            <div className="space-y-3">
              {loans.map((loan: any) => (
                <div
                  key={loan.id}
                  className={`border rounded-lg p-3 space-y-1.5 transition-colors duration-300 ${LOAN_CARD_STYLE[loan.status?.toUpperCase()] ||
                    "border-gray-300 bg-white"
                    }`}
                >



                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-semibold">
                        {loan.loan_type.replace("_", " ")}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Bank: {loan.bank_name || "-"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">


                      {/* STATUS DROPDOWN */}
                      <select
                        value={loan.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;

                          // 1️⃣ Backend update
                          await fetch(`/api/loans/${loan.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: newStatus }),
                          });

                          // 2️⃣ FRONTEND STATE UPDATE (🔥 THIS WAS MISSING)
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



                  </div>

                  <p className="text-xs text-gray-700">
                    ₹{loan.loan_amount} • {loan.interest_rate || "-"}% •{" "}
                    {loan.tenure_years || "-"} yrs
                  </p>

                  {loan.remarks && (
                    <p className="text-xs text-gray-500">
                      <b>Remarks:</b> {loan.remarks}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="font-medium">Documents:</p>

                    {loan.documents && loan.documents.length > 0 ? (
                      <ul className="space-y-1">
                        {loan.documents.map((doc: any) => (
                          <li key={doc.id} className="flex items-center gap-2">
                            📄
                            <a
                              href={doc.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 underline"
                            >
                              {doc.file_name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">No documents</p>
                    )}

                    <button
                      onClick={() => openUploadModal(loan.id)}
                      className="text-indigo-600 underline mt-1"
                    >
                      Upload
                    </button>
                  </div>


                  <div className="flex gap-4 text-xs text-gray-600 pt-1">
                    <button onClick={() => openEditLoanModal(loan)}>
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteLoan(loan.id)}
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





        {/* ===== ACTIVITY LOGS ===== */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-4 text-gray-700">
            Activity Timeline
          </h2>

          {activityLogs.length === 0 ? (
            <p className="text-sm text-gray-400">No activity yet</p>
          ) : (
            <ul className="space-y-3">
              {activityLogs.map((log, idx) => (
                <li key={idx} className="text-sm">
                  <div className="text-gray-700">{log.description}</div>
                  <div className="text-xs text-gray-400">
                    by {log.performed_by_name ?? "System"}{" "}
                    {log.performed_by_role ? `(${log.performed_by_role})` : ""}
                    {" • "}
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ===== MATCHED PROPERTIES ===== */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Matched Properties
          </h2>

          <div className="space-y-4">
            {matches.map((seller) => {
              const status =
                statusMap[seller.id] ??
                seller.buyer_property_status ??
                "New";

              const isDiscarded = status === "Discarded";

              return (
                <div
                  key={seller.id}
                  className={`bg-white rounded-xl shadow-sm p-5 flex justify-between ${isDiscarded ? "opacity-60" : ""
                    }`}
                >



                  <div className="space-y-1 text-sm">

                    {/* SHOW / HIDE IMAGES */}
                    <button
                      onClick={() =>
                        setOpenImages((prev) => ({
                          ...prev,
                          [seller.id]: !prev[seller.id],
                        }))
                      }
                      className="text-xs text-indigo-600 underline mb-2"
                    >
                      {openImages[seller.id] ? "Hide Images" : "Show Images"}
                    </button>

                    {/* IMAGES SECTION */}
                    {openImages[seller.id] && sellerPhotos[seller.id]?.length > 0 && (
                      <div className="mt-3 space-y-2">

                        {/* MAIN IMAGE */}
                        <img
                          src={sellerPhotos[seller.id][0].photo_url}
                          alt="property"
                          className="w-56 h-36 object-cover rounded-lg border"
                        />

                        {/* THUMBNAILS */}
                        <div className="flex gap-2">
                          {sellerPhotos[seller.id].slice(1, 4).map((p: any) => (
                            <img
                              key={p.id}
                              src={p.photo_url}
                              alt="thumb"
                              className="w-16 h-12 object-cover rounded-md border"
                            />
                          ))}
                        </div>
                      </div>





                    )}

                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-sm font-semibold mb-3 text-gray-700">
                        Government Property Price Estimation
                      </h2>

                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          placeholder="Enter area size (sq ft)"
                          value={areaSize}
                          onChange={(e) => setAreaSize(e.target.value)}
                          className="border rounded-lg px-3 py-2 text-sm w-60 focus:ring-2 focus:ring-indigo-500"
                        />

                        <button
                          onClick={handleGovtPriceEstimate}
                          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          Get Govt Estimate
                        </button>
                      </div>

                      {govtEstimatedPrice && (
                        <p className="mt-4 text-green-700 text-sm font-medium">
                          Estimated Government Value: ₹{govtEstimatedPrice.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <p className="font-medium">
                      {seller.property_type || "Property"}
                    </p>

                    <p className="text-gray-600">
                      ₹{seller.price} • {seller.bedrooms} BHK
                    </p>

                    <p className="mt-2">
                      <span className="font-medium">Seller:</span>{" "}
                      {seller.seller_name}
                    </p>

                    {seller.seller_contact && (
                      <p className="text-xs text-gray-500">
                        {seller.seller_contact}
                      </p>
                    )}

                    {seller.seller_email && (
                      <p className="text-xs text-gray-500">
                        {seller.seller_email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs text-gray-400 mb-1">
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
                      className="border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== ADD LOAN MODAL ===== */}
        {showLoanModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[420px] space-y-3">
              <h3 className="text-sm font-semibold">
                {editingLoan ? "Edit Loan" : "Add Loan"}
              </h3>


              {/* Loan Type */}
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowLoanModal(false)}
                  className="text-sm px-4 py-2"
                >
                  Cancel
                </button>

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
                      // ✏️ EDIT MODE
                      await fetch(`/api/loans/${editingLoan.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      });
                    } else {
                      // ➕ ADD MODE
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[380px] space-y-4">
              <h3 className="text-sm font-semibold">
                Upload Document
              </h3>

              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) =>
                  setUploadFile(e.target.files?.[0] || null)
                }
                className="text-sm"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-sm px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg"
                  onClick={async () => {
                    if (!uploadFile || !uploadLoanId) return;

                    const formData = new FormData();
                    formData.append("file", uploadFile);

                    // 🔥 YE HI WO CODE HAI JO TUM PUCH RAHI THI
                    await fetch(
                      `/api/loans/${uploadLoanId}/documents`,
                      {
                        method: "POST",
                        body: formData,
                      }
                    );

                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadLoanId(null);
                    fetchLoans(); // refresh list
                  }}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}




      </div>
    );
  }
  /* ===== SMALL INFO CARD ===== */
  function Info({ label, value }: any) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium mt-1">{value}</p>



      </div>
    );
  }
