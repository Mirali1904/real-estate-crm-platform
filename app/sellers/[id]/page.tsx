"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SellerDetailPage() {
  const params = useParams();
  const sellerId = Number(params?.id);

  const [seller, setSeller] = useState<any>(null);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [buyerStatus, setBuyerStatus] = useState<Record<number, string>>({});
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const STATUS_OPTIONS = [
    "New",
    "Interested",
    "Shortlisted",
    "Site Visit Planned",
    "Deal Closed",
    "Not Interested",
  ];

  /* ---------------- LOAD TENANT ---------------- */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;
    const user = JSON.parse(raw);
    setTenantId(user.tenant_id ?? user.tenantId);
  }, []);

  /* ---------------- LOAD SELLER + BUYERS ---------------- */
  useEffect(() => {
    if (!sellerId || !tenantId) return;

    async function loadData() {
      try {
        /* SELLER */
        const sellerRes = await fetch(`/api/sellers/${sellerId}`);
        if (!sellerRes.ok) return;
        setSeller(await sellerRes.json());

        /* MATCHED BUYERS */
        const buyersRes = await fetch(
          `/api/sellers/${sellerId}/matches`,
          {
            headers: { "x-tenant-id": String(tenantId) },
          }
        );

        if (!buyersRes.ok) return;
        const buyersData = await buyersRes.json();
        setBuyers(buyersData.matches || []);

        /* BUYER-PROPERTY STATUS (REVERSE LOOKUP) */
        const statusRes = await fetch(
          `/api/sellers/${sellerId}/buyer-status`,
          {
            headers: { "x-tenant-id": String(tenantId) },
          }
        );

        if (statusRes.ok) {
          const data = await statusRes.json();
          const map: Record<number, string> = {};
          data.statuses.forEach((r: any) => {
            map[r.buyer_id] = r.status;
          });
          setBuyerStatus(map);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [sellerId, tenantId]);

  /* ---------------- CARD STYLE ---------------- */
  function getCardStyle(status: string) {
    switch (status) {
      case "Interested":
        return "border-green-400 bg-green-50";
      case "Shortlisted":
        return "border-green-600 bg-green-100";
      case "Site Visit Planned":
        return "border-yellow-400 bg-yellow-50";
      case "Deal Closed":
        return "border-green-700 bg-green-200";
      case "Not Interested":
        return "border-gray-300 bg-gray-100 opacity-60";
      default:
        return "border-gray-200 bg-white";
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!seller) return <div className="p-6">Seller not found</div>;

  return (
    <div className="w-full p-6 space-y-6">
      {/* SELLER DETAILS */}
      <div className="border rounded-xl p-6 bg-white">
        <h1 className="text-xl font-semibold mb-2">
          Property Details
        </h1>

        <div className="text-sm space-y-1">
          <p><strong>Price:</strong> ₹{seller.price}</p>
          <p><strong>Bedrooms:</strong> {seller.bedrooms}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="text-orange-600 font-medium">
              {seller.status}
            </span>
          </p>
        </div>
      </div>

      {/* MATCHED BUYERS */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Matched Buyers
        </h2>

        {buyers.length === 0 && (
          <p className="text-sm text-gray-500">
            No compatible buyers found
          </p>
        )}

        <div className="space-y-4">
          {buyers.map((buyer) => {
            const status = buyerStatus[buyer.id] || "New";
            const isRejected = status === "Not Interested";

            return (
              <div
                key={buyer.id}
                className={`border rounded-xl p-4 flex justify-between items-center
                  ${getCardStyle(status)}
                  ${isRejected ? "pointer-events-none opacity-60" : ""}`}
              >
                {/* LEFT */}
                <div className="text-sm space-y-1">
                  <p className="font-medium">{buyer.name}</p>
                  <p className="text-gray-600">
                    {buyer.email} • {buyer.phone}
                  </p>
                  <p>
                    ₹{buyer.budget_min} – ₹{buyer.budget_max}
                  </p>
                  <p className="text-xs text-gray-500">
                    Distance: {buyer.distance_km.toFixed(2)} km
                  </p>
                  {isRejected && (
                    <p className="text-xs text-red-500">
                      Buyer marked as Not Interested
                    </p>
                  )}
                </div>

                {/* RIGHT */}
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">
                    Buyer Status
                  </label>
                  <select
                    value={status}
                    disabled={isRejected}
                    onChange={async (e) => {
                      const newStatus = e.target.value;

                      setBuyerStatus((prev) => ({
                        ...prev,
                        [buyer.id]: newStatus,
                      }));

                      const raw = localStorage.getItem("loggedUser");
                      if (!raw) return;
                      const user = JSON.parse(raw);
                      const tenantId =
                        user.tenant_id ?? user.tenantId;

                      const res = await fetch(
                        `/api/buyers/${buyer.id}/property-status`,
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

                      if (res.ok && newStatus === "Deal Closed") {
                        setSeller((prev: any) => ({
                          ...prev,
                          status: "SOLD",
                        }));
                      }
                    }}
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
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
