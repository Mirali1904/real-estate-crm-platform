"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function BuyerDetailPage() {
  const params = useParams();
  const buyerId = Number(params?.id);

  const [buyer, setBuyer] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});

  /* Status options - ONLY for buyer side */
  const STATUS_OPTIONS = [
    "New",
    "Interested",
    "Site Visit Planned",
    "Deal Closed",
    "Discarded",
  ];

  useEffect(() => {
    if (!buyerId) return;

    async function loadData() {
      try {
        const raw = localStorage.getItem("loggedUser");
        if (!raw) return;

        const user = JSON.parse(raw);
        const tenantId = user.tenant_id ?? user.tenantId;

        /* Fetch buyer details */
        const buyerRes = await fetch(`/api/buyers/${buyerId}`, {
          headers: { "x-tenant-id": String(tenantId) },
        });
        if (!buyerRes.ok) return;
        setBuyer(await buyerRes.json());

        /* Fetch matched properties */
        const matchRes = await fetch(`/api/buyers/${buyerId}/matches`, {
          headers: { "x-tenant-id": String(tenantId) },
        });
        if (!matchRes.ok) return;
        const sellers = (await matchRes.json()).matches || [];
        setMatches(sellers);

        /* Fetch status for all properties */
        const statusRes = await fetch(
          `/api/buyers/${buyerId}/property-status`,
          {
            headers: { "x-tenant-id": String(tenantId) },
          }
        );

        if (statusRes.ok) {
          const data = await statusRes.json();
          const map: Record<number, string> = {};
          data.statuses.forEach((r: any) => {
            map[r.seller_id] = r.status || "New";
          });
          setStatusMap(map);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [buyerId]);

  function getCardStyle(status: string) {
    switch (status) {
      case "Interested":
        return "border-green-400 bg-green-50";
      case "Site Visit Planned":
        return "border-yellow-400 bg-yellow-50";
      case "Deal Closed":
        return "border-green-700 bg-green-200";
      case "Discarded":
        return "border-gray-300 bg-gray-100 opacity-60";
      default:
        return "border-gray-200 bg-white";
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!buyer) return <div className="p-6">Buyer not found</div>;

  return (
    <div className="w-full p-6 space-y-6">
      {/* Buyer Details */}
      <div className="w-full border rounded-xl p-6 bg-white">
        <h1 className="text-xl font-semibold">{buyer.name}</h1>
        <p className="text-sm text-gray-600">{buyer.email}</p>
        <p className="text-sm text-gray-600">{buyer.phone}</p>

        <div className="mt-4 text-sm space-y-1">
          <p>
            <strong>Requirement:</strong> {buyer.requirement}
          </p>
          <p>
            <strong>Budget:</strong> ₹{buyer.budget_min} – ₹{buyer.budget_max}
          </p>
          <p>
            <strong>Bedrooms:</strong> {buyer.bedrooms}
          </p>
          <p>
            <strong>Radius:</strong> {buyer.radius_km} km
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="text-orange-600 font-medium">
              {buyer.status}
            </span>
          </p>
        </div>
      </div>

      {/* Matched Properties */}
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-3">Matched Properties</h2>

        <div className="space-y-4">
          {matches.map((seller) => {
            const status = statusMap[seller.id] || "New";
            const isDiscarded = status === "Discarded";

            return (
              <div
                key={seller.id}
                className={`w-full border rounded-xl p-4 flex justify-between items-center ${getCardStyle(
                  status
                )} ${isDiscarded ? "pointer-events-none opacity-60" : ""}`}
              >
                <div className="text-sm space-y-1">
                  <p className="font-medium">
                    {seller.property_type || "Property"}
                  </p>
                  <p className="text-gray-600">
                    ₹{seller.price} • {seller.bedrooms} BHK
                  </p>

                  <p className="font-medium mt-2">
                    Seller: {seller.seller_name}
                  </p>

                  {seller.seller_contact && (
                    <p className="text-xs text-gray-500">
                      Contact: {seller.seller_contact}
                    </p>
                  )}

                  {seller.seller_email && (
                    <p className="text-xs text-gray-500">
                      {seller.seller_email}
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">
                    Buyer Action
                  </label>

                  <select
                    value={status}
                    disabled={isDiscarded}
                    onChange={async (e) => {
                      const newStatus = e.target.value;

                      setStatusMap((prev) => ({
                        ...prev,
                        [seller.id]: newStatus,
                      }));

                      const raw = localStorage.getItem("loggedUser");
                      if (!raw) return;
                      const user = JSON.parse(raw);
                      const tenantId = user.tenant_id ?? user.tenantId;

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