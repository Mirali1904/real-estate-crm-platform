"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SellerDetailPage() {
 const params = useParams();

/* ✅ SAFE sellerId extraction */
const sellerId =
  typeof params?.id === "string" ? Number(params.id) : null;

/* 🔥 DEBUG (temporary) */
console.log("FINAL sellerId 👉", sellerId);


  const [seller, setSeller] = useState<any>(null);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [remarks, setRemarks] = useState("");
const [savingRemarks, setSavingRemarks] = useState(false);

const [activityLogs, setActivityLogs] = useState<any[]>([]);
const [photos, setPhotos] = useState<any[]>([]);
const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);



  const [tenantId, setTenantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const STATUS_OPTIONS = [
    "New",
    "Contacted",
    "Site Visit Done",
    "Dropped",
  ];

  async function uploadPhotos() {

      console.log("UPLOAD CLICKED", selectedFiles);
  if (!selectedFiles || selectedFiles.length === 0) return;

  const formData = new FormData();

  Array.from(selectedFiles).forEach((file) => {
    formData.append("photos", file);
  });

  const res = await fetch(`/api/sellers/${sellerId}/photos`, {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    // re-fetch photos after upload
    const photosRes = await fetch(`/api/sellers/${sellerId}/photos`);
    if (photosRes.ok) {
      const data = await photosRes.json();
      setPhotos(data || []);
    }

    // reset file input
    setSelectedFiles(null);
  }
}


  async function fetchActivityLogs(tenantId: number) {
  const res = await fetch(
    `/api/activity-logs?tenantId=${tenantId}&entityType=seller&entityId=${sellerId}`
  );

  if (res.ok) {
    setActivityLogs(await res.json());
  }
}


  /* LOAD TENANT */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;
    const user = JSON.parse(raw);
    setTenantId(user.tenant_id ?? user.tenantId);
  }, []);

  /* LOAD SELLER + BUYERS */
  useEffect(() => {
  if (!sellerId || !tenantId) return;

  async function loadData() {
    try {
      const sellerRes = await fetch(`/api/sellers/${sellerId}`);
      if (sellerRes.ok) {
        const data = await sellerRes.json();
        setSeller(data);
        setRemarks(data.remarks || "");
      }

      const buyersRes = await fetch(
        `/api/sellers/${sellerId}/buyer-status`,
        {
          headers: { "x-tenant-id": String(tenantId) },
        }
      );

      if (buyersRes.ok) {
        const data = await buyersRes.json();
        setBuyers(data.buyers || []);
      }

            /* ===== LOAD PROPERTY PHOTOS ===== */
      const photosRes = await fetch(
        `/api/sellers/${sellerId}/photos`
      );

      if (photosRes.ok) {
        const data = await photosRes.json();
        setPhotos(data || []);
      }


      // ✅ ADD THIS LINE
    if (tenantId) {
  await fetchActivityLogs(tenantId);
}


    } finally {
      setLoading(false);
    }
  }

  loadData();
}, [sellerId, tenantId]);

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

  return (
    <div className="w-full px-6 pt-2 space-y-6">

      {/* ===== SELLER HEADER CARD (BUYER STYLE) ===== */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
            {seller.name?.[0]?.toUpperCase() || "S"}
          </div>

          <div>
            <h1 className="text-lg font-semibold">
              {seller.property_type || "Property"}
            </h1>
            <p className="text-sm text-gray-500">
              Seller: {seller.name}
            </p>
            {seller.email && (
              <p className="text-sm text-gray-500">{seller.email}</p>
            )}
            {seller.owner_contact && (
              <p className="text-sm text-gray-500">
                {seller.owner_contact}
              </p>
            )}
          </div>
        </div>

        <span
          className={`h-fit px-3 py-1 text-xs rounded-full font-medium ${statusBadge(
            seller.status
          )}`}
        >
          {seller.status}
        </span>
      </div>

      {/* ===== SELLER META (GRID LIKE BUYER) ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Info label="Price" value={`₹${seller.price}`} />
        <Info label="Bedrooms" value={seller.bedrooms} />
        <Info label="Contact" value={seller.owner_contact || "-"} />
        <Info label="Status" value={seller.status} />
      </div>

      


      {/* ===== SELLER REMARKS ===== */}
<div className="bg-white rounded-xl shadow-sm p-6">
  <h2 className="text-sm font-semibold mb-2 text-gray-700">
    Internal Remarks
  </h2>

  <textarea
    value={remarks}
    onChange={(e) => setRemarks(e.target.value)}
    rows={3}
    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
    placeholder="Add internal remarks about this seller..."
  />

  <div className="flex justify-end mt-3">
<button


  disabled={savingRemarks}
  
  onClick={async () => {
    try {

      if (!sellerId) {
  alert("Seller ID not found");
  return;
}

if (!tenantId) {
      alert("Tenant not loaded yet");
      return;
    }

      setSavingRemarks(true);

      const raw = localStorage.getItem("loggedUser");
      if (!raw) {
        alert("Not logged in");
        return;
      }

      const user = JSON.parse(raw);
      if (!tenantId) {
        alert("Tenant not loaded");
        return;
      }

      const res = await fetch("/api/sellers/remarks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId,
          tenantId,
          remarks,
          updatedBy: user.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to save remarks");
        return;
      }

      // ✅ update UI
      setSeller((prev: any) => ({
        ...prev,
        remarks,
      }));

      // ✅ reload timeline
      await fetchActivityLogs(tenantId);
    } catch (err) {
      console.error("Save remarks error", err);
      alert("Something went wrong");
    } finally {
      // 🔥 MOST IMPORTANT
      setSavingRemarks(false);
    }
  }}
  className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
>
  {savingRemarks ? "Saving..." : "Save Remarks"}
</button>



  </div>
</div>

{/* ===== PROPERTY PHOTOS ===== */}
<div className="bg-white rounded-xl shadow-sm p-6">
  <h2 className="text-sm font-semibold mb-3 text-gray-700">
    Property Photos
  </h2>

  {/* UPLOAD PHOTOS */}
<div className="mb-4 flex items-center gap-3">
  <input
    type="file"
    multiple
    onChange={(e) => setSelectedFiles(e.target.files)}
    className="text-sm"
  />

  <button
    onClick={uploadPhotos}
    className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
  >
    Upload Photos
  </button>
</div>


  {photos.length === 0 ? (
    <p className="text-sm text-gray-400">
      No photos uploaded yet
    </p>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {photos.map((photo: any) => (
        <img
          key={photo.id}
          src={photo.photo_url}
          alt="Property"
          className="h-32 w-full object-cover rounded-lg border"
        />
      ))}
    </div>
  )}
</div>


{/* ===== ACTIVITY TIMELINE ===== */}
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



      {/* ===== BUYERS TABLE (BUYER MATCH STYLE) ===== */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Buyers (Seller Action)
        </h2>

        <div className="space-y-4">
          {buyers.map((buyer) => {
            const status = buyer.status || "New";
            const isDropped = status === "Dropped";

            return (
              <div
                key={buyer.buyer_id}
                className={`bg-white rounded-xl shadow-sm p-5 flex justify-between ${
                  isDropped ? "opacity-60" : ""
                }`}
              >
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{buyer.name}</p>
                  <p className="text-gray-600">
                    {buyer.email} • {buyer.phone}
                  </p>
                  <p>
                    ₹{buyer.budget_min} – ₹{buyer.budget_max}
                  </p>

                  <p className="text-xs mt-1">
                    <span className="text-gray-400">
                      Buyer Interest:
                    </span>{" "}
                    <span className="font-medium">{status}</span>
                  </p>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">
                    Seller Action
                  </label>

                  <select
                    value={status}
                    disabled={isDropped}
                    onChange={async (e) => {
                      const newStatus = e.target.value;

                      setBuyers((prev) =>
                        prev.map((b) =>
                          b.buyer_id === buyer.buyer_id
                            ? { ...b, status: newStatus }
                            : b
                        )
                      );

                      const raw = localStorage.getItem("loggedUser");
                      if (!raw) return;
                      const user = JSON.parse(raw);
                      const tenantId =
                        user.tenant_id ?? user.tenantId;

                      await fetch(
                        `/api/buyers/${buyer.buyer_id}/property-status`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "x-tenant-id": String(tenantId),
                          },
                          body: JSON.stringify({
                            sellerId,
                            status: newStatus,
                          }),
                        }
                      );
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
