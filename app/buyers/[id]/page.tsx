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

  const STATUS_OPTIONS = [
    "New",
    "Contacted",
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

        const buyerRes = await fetch(`/api/buyers/${buyerId}`, {
          headers: { "x-tenant-id": String(tenantId) },
        });
        if (buyerRes.ok) setBuyer(await buyerRes.json());

        const matchRes = await fetch(`/api/buyers/${buyerId}/matches`, {
          headers: { "x-tenant-id": String(tenantId) },
        });

        if (matchRes.ok) {
          const sellers = (await matchRes.json()).matches || [];
          setMatches(sellers);

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
                className={`bg-white rounded-xl shadow-sm p-5 flex justify-between ${
                  isDiscarded ? "opacity-60" : ""
                }`}
              >
                <div className="space-y-1 text-sm">
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
