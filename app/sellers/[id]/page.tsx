// app/sellers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SellerDetailPage() {
  const params: any = useParams();
  const sellerId = params?.id;
  const router = useRouter();

  const [tenantId, setTenantId] = useState<number | null>(null);
  const [seller, setSeller] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingSeller, setLoadingSeller] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // get tenantId from logged user (localStorage)
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setTenantId(parsed?.tenantId ?? parsed?.tenant_id ?? null);
      } catch (e) {
        setTenantId(null);
      }
    }
  }, []);

  // fetch seller
  useEffect(() => {
    if (!sellerId) return;
    setLoadingSeller(true);
    fetch(`/api/sellers/${sellerId}`)
      .then((r) => r.json())
      .then((d) => {
        // API returns either { success: true, seller } or the seller object directly in some code paths.
        if (d && d.success && d.seller) setSeller(d.seller);
        else if (d && d.id) setSeller(d);
        else setSeller(null);
      })
      .catch((err) => {
        console.error("fetch seller error", err);
        setSeller(null);
      })
      .finally(() => setLoadingSeller(false));
  }, [sellerId]);

  // fetch matches (buyers compatible with this seller)
  useEffect(() => {
    if (!sellerId) return;
    // prefer tenantId from localStorage; fallback to URL query param (rare)
    const t = tenantId ?? new URL(window.location.href).searchParams.get("tenantId");
    if (!t) {
      // no tenantId -> can't fetch matches
      setMatches([]);
      return;
    }

    setLoadingMatches(true);
    fetch(`/api/sellers/${sellerId}/matches?tenantId=${t}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.success && Array.isArray(d.matches)) setMatches(d.matches);
        else setMatches([]);
      })
      .catch((err) => {
        console.error("fetch seller matches error", err);
        setMatches([]);
      })
      .finally(() => setLoadingMatches(false));
  }, [sellerId, tenantId]);

  if (loadingSeller) return <div className="p-6">Loading property...</div>;
  if (!seller) return <div className="p-6">Property not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="bg-white border rounded p-4">
        <h2 className="text-xl font-bold">{seller.property_address || seller.name}</h2>
        <p className="text-sm text-gray-600">{seller.owner_email ?? seller.email} • {seller.owner_contact ?? seller.phone}</p>
        <p className="mt-2">Type: {seller.property_type || "—"}</p>
        <p>
          Location: {seller.location ?? "—"} • Lat: {seller.lat ?? "—"}, Lng: {seller.lng ?? "—"}
        </p>
        <p>Price: {seller.price ?? "—"} • Bedrooms: {seller.bedrooms ?? "—"}</p>
        <p>Status: <strong>{seller.status}</strong></p>
      </div>

      <h3 className="mt-8 mb-3 text-lg font-semibold">Matches ({matches.length})</h3>

      {loadingMatches && <p>Finding matching buyers...</p>}

      <div className="space-y-3">
        {!loadingMatches && matches.length === 0 && (
          <p className="text-sm text-gray-500">No matching buyers found.</p>
        )}

        {matches.map((m: any) => {
          // matchService returns { buyer, distance_km, score }
          const buyer = m.buyer ?? m.seller ?? m; // defensive
          const distance = m.distance_km ?? m.distance ?? 0;
          const score = m.score ?? 0;

          return (
            <div key={buyer.id} className="border rounded p-3 flex justify-between items-start">
              <div>
                <div className="font-medium">{buyer.name || "Buyer"}</div>
                {buyer.email && <div className="text-xs text-gray-500">{buyer.email}</div>}
                {buyer.phone && <div className="text-xs text-gray-500">{buyer.phone}</div>}
                {buyer.requirement && <div className="text-xs mt-1">Requirement: {buyer.requirement}</div>}
                <div className="text-xs mt-1">Budget: {buyer.budget_min ?? "—"} - {buyer.budget_max ?? "—"}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Distance: {Number(distance).toFixed(2)} km • Score: {score}
                </div>
              </div>

              <div className="ml-4">
                <a
                  href={`/buyers/${buyer.id}`}
                  onClick={(e) => {
                    // allow normal navigation; ensure it doesn't bubble weirdly
                  }}
                  className="text-sm underline"
                >
                  Open
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
