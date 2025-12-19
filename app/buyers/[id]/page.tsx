"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

export default function BuyerDetailPage() {
  const params = useParams();
  const buyerId = Number(params?.id);
  const tenantId = 1;

  const [buyer, setBuyer] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!buyerId) return;

    async function loadData() {
      try {
        const buyerRes = await fetch(`/api/buyers/${buyerId}`);
        if (!buyerRes.ok) return;
        const buyerData = await buyerRes.json();
        setBuyer(buyerData);
        setSelectedSellerId(buyerData?.selected_seller_id ?? null);

        const matchRes = await fetch(
          `/api/buyers/${buyerId}/matches?tenantId=${tenantId}`
        );

        if (!matchRes.ok) {
          setMatches([]);
          return;
        }

        const matchData = await matchRes.json();
        setMatches(matchData.matches || []);
      } catch (err) {
        console.error("Failed loading buyer page", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [buyerId]);

  async function markInterested(sellerId: number) {
    const res = await fetch(`/api/buyers/${buyerId}/interest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerId }),
    });

    if (!res.ok) {
      alert("Failed to mark interest");
      return;
    }

    setSelectedSellerId(sellerId);
    setBuyer((b: any) => ({ ...b, status: "WON" }));
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!buyer) return <div className="p-6">Buyer not found</div>;

  return (
    <div className="w-full p-6 space-y-6">
      {/* BUYER DETAILS */}
      <div className="w-full border rounded-xl p-6 bg-white">
        <h1 className="text-xl font-semibold">{buyer.name}</h1>
        <p className="text-sm text-gray-600">{buyer.email}</p>
        <p className="text-sm text-gray-600">{buyer.phone}</p>

        <div className="mt-4 text-sm space-y-1">
          <p><strong>Requirement:</strong> {buyer.requirement}</p>
          <p><strong>Budget:</strong> ₹{buyer.budget_min} – ₹{buyer.budget_max}</p>
          <p><strong>Bedrooms:</strong> {buyer.bedrooms}</p>
          <p><strong>Radius:</strong> {buyer.radius_km} km</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="text-orange-600 font-medium">
              {buyer.status}
            </span>
          </p>
        </div>
      </div>

      {/* MATCHED PROPERTIES */}
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-3">Matched Properties</h2>

        {matches.length === 0 && (
          <div className="border rounded-xl p-4 text-sm text-gray-500">
            No matching properties found
          </div>
        )}

        <div className="space-y-4">
          {matches.map((seller) => (
            <div
              key={seller.id}
              className="w-full border rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {seller.property_type || "Property"}
                </p>
                <p className="text-sm text-gray-600">
                  ₹{seller.price} • {seller.bedrooms} BHK
                </p>

                {seller.distance_km !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    Distance: {seller.distance_km.toFixed(2)} km
                  </p>
                )}
              </div>

              {selectedSellerId === seller.id ? (
                <SecondaryButton className="bg-green-500 text-white border-green-600">
                  Interested
                </SecondaryButton>
              ) : (
                <PrimaryButton onClick={() => markInterested(seller.id)}>
                  Mark Interested
                </PrimaryButton>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
