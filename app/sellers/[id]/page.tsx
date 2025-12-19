"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

export default function SellerDetailPage() {
  const params = useParams();
  const sellerId = Number(params?.id);
  const tenantId = 1; // 🔴 IMPORTANT

  const [seller, setSeller] = useState<any>(null);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [error, setError] = useState("");

  /* -------------------------------
     FETCH SELLER + MATCHED BUYERS
  -------------------------------- */
  useEffect(() => {
    if (!sellerId) return;

    // Fetch seller
    fetch(`/api/sellers/${sellerId}`)
      .then((r) => r.json())
      .then(setSeller);

    // Fetch matched buyers
    fetch(`/api/sellers/${sellerId}/matches?tenantId=${tenantId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to fetch matches");
        return r.json();
      })
      .then((d) => setBuyers(d.matches || []))
      .catch(() => setError("Failed to fetch matches"));
  }, [sellerId]);

  if (!seller) return <div className="p-6">Loading...</div>;

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
          <p><strong>Status:</strong> {seller.status}</p>
        </div>
      </div>

      {/* MATCHED BUYERS */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Matched Buyers
        </h2>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!error && buyers.length === 0 && (
          <p className="text-sm text-gray-500">
            No compatible buyers found
          </p>
        )}

        <div className="space-y-3">
          {buyers.map((buyer) => (
            <div
              key={buyer.id}
              className="border rounded-xl p-4 flex justify-between items-center bg-white"
            >
              <div className="text-sm space-y-1">
                <p className="font-medium">{buyer.name}</p>
                <p className="text-gray-600">
                  {buyer.email} • {buyer.phone}
                </p>
                <p>
                  ₹{buyer.budget_min} – ₹{buyer.budget_max}
                </p>
                <p className="text-xs text-gray-500">
                  Distance: {buyer.distance_km.toFixed(2)} km (radius {buyer.radius_km} km)
                </p>
              </div>

              <PrimaryButton>
                Mark Interested
              </PrimaryButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
