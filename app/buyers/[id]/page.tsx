// app/buyers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function BuyerDetailPage() {
  const params: any = useParams();
  const buyerId = params?.id;

  const [tenantId, setTenantId] = useState<number | null>(null);
  const [buyer, setBuyer] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setTenantId(parsed?.tenantId || parsed?.tenant_id || null);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!buyerId) return;
    setLoading(true);

    fetch(`/api/buyers/${buyerId}`)
      .then(r => r.json())
      .then(d => setBuyer(d))
      .catch(() => setBuyer(null));

    const t = tenantId ?? new URL(window.location.href).searchParams.get("tenantId");
    if (t) {
      fetch(`/api/buyers/${buyerId}/matches?tenantId=${t}`)
        .then(r => r.json())
        .then(d => { if (d.success) setMatches(d.matches || []); })
        .catch(() => setMatches([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [buyerId, tenantId]);

  if (!buyer) return <div className="p-6">Loading buyer...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="bg-white border rounded p-4">
        <h2 className="text-xl font-bold">{buyer.name}</h2>
        <p className="text-sm text-gray-600">{buyer.email} • {buyer.phone}</p>
        <p className="mt-2">Requirement: {buyer.requirement}</p>
        <p>Location: {buyer.lat ?? "—"}, {buyer.lng ?? "—"} • Radius: {buyer.radius_km ?? 5} km</p>
        <p>Budget: {buyer.budget_min ?? "—"} - {buyer.budget_max ?? "—"}</p>
        <p>Status: <strong>{buyer.status}</strong></p>
      </div>

      <h3 className="mt-8 mb-3 text-lg font-semibold">Matches ({matches.length})</h3>
      {loading && <p>Finding matches...</p>}

      <div className="space-y-3">
        {matches.length === 0 && !loading && <p className="text-sm text-gray-500">No matches found.</p>}
        {matches.map((m: any) => (
          <div key={m.seller.id} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-medium">{m.seller.property_type || m.seller.property_address || "Property"}</div>
              <div className="text-xs text-gray-500">{m.seller.property_address || m.seller.location}</div>
              <div className="text-xs">Price: {m.seller.price} • Bedrooms: {m.seller.bedrooms}</div>
              <div className="text-xs text-gray-500">Distance: {m.distance_km.toFixed(2)} km • Score: {m.score}</div>
            </div>
            <div>
              <a className="text-sm underline" href={`/sellers/${m.seller.id}`}>Open</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
