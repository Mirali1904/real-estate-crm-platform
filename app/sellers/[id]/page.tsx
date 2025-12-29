"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SellerDetailPage() {
  const params = useParams();
  const sellerId = Number(params?.id);

  const [seller, setSeller] = useState<any>(null);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const STATUS_OPTIONS = [
    "New",
    "Contacted",
    "Site Visit Done",
    "Dropped",
  ];

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
          setSeller(await sellerRes.json());
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
