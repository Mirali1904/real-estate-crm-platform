// app/sellers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SellerDetailPage() {
  const params: any = useParams();
  const sellerId = params?.id;

  const [tenantId, setTenantId] = useState<number | null>(null);
  const [seller, setSeller] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingSeller, setLoadingSeller] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chosenBuyerId, setChosenBuyerId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        setTenantId(parsed?.tenantId ?? parsed?.tenant_id ?? null);
      }
    } catch (e) {
      setTenantId(null);
    }
  }, []);

  useEffect(() => {
    if (!sellerId) return;
    setLoadingSeller(true);
    fetch(`/api/sellers/${sellerId}`)
      .then(r => r.json())
      .then(d => {
        if (d && d.success && d.seller) {
          setSeller(d.seller);
          if (d.seller.selected_buyer_id) setChosenBuyerId(Number(d.seller.selected_buyer_id));
        } else if (d.id) {
          setSeller(d);
          if (d.selected_buyer_id) setChosenBuyerId(Number(d.selected_buyer_id));
        } else {
          setSeller(d || null);
        }
      })
      .catch(err => {
        console.error("fetch seller", err);
        setSeller(null);
      })
      .finally(() => setLoadingSeller(false));
  }, [sellerId, saving]);

  useEffect(() => {
    if (!sellerId) return;
    const t = tenantId ?? new URL(window.location.href).searchParams.get("tenantId");
    if (!t) {
      setMatches([]);
      return;
    }
    setLoadingMatches(true);
    fetch(`/api/sellers/${sellerId}/matches?tenantId=${t}`)
      .then(r => r.json())
      .then(d => {
        if (!d) return setMatches([]);
        if (d.success && Array.isArray(d.matches)) setMatches(d.matches);
        else if (Array.isArray(d)) setMatches(d);
        else setMatches([]);
      })
      .catch(err => {
        console.error("fetch buyer matches for seller", err);
        setMatches([]);
      })
      .finally(() => setLoadingMatches(false));
  }, [sellerId, tenantId, saving]);

  if (loadingSeller) return <div className="p-6">Loading seller...</div>;
  if (!seller) return <div className="p-6">Seller not found.</div>;

  async function updateSeller(fields: Record<string, any>) {
    const res = await fetch(`/api/sellers/${sellerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `status ${res.status}`);
    }
    return await res.json().catch(() => ({}));
  }

  async function updateBuyer(buyerId: number, fields: Record<string, any>) {
    const res = await fetch(`/api/buyers/${buyerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `status ${res.status}`);
    }
    return await res.json().catch(() => ({}));
  }

  async function handleMarkInterested(buyerId: number) {
    if (chosenBuyerId === buyerId) {
      if (!confirm("Do you want to remove your interest selection? This will not revert DB statuses.")) return;
      setChosenBuyerId(null);
      return;
    }

    if (!confirm("Mark this buyer as interested? This will update seller and buyer statuses.")) return;

    setSaving(true);
    setChosenBuyerId(buyerId);

    try {
      // 1) update seller: selected_buyer_id and status = SOLD
      await updateSeller({ selected_buyer_id: buyerId, status: "SOLD" });

      // 2) update buyer: set selected_seller_id = sellerId and status = WON
      await updateBuyer(buyerId, { selected_seller_id: Number(sellerId), status: "WON" });

      setSaving(s => !s);
      alert("Saved: seller marked SOLD and buyer set to WON.");
    } catch (err) {
      console.error("save selection failed", err);
      setChosenBuyerId(null);
      alert("Failed to save selection. See console for details.");
    } finally {
      setSaving(false);
    }
  }

  const visibleMatches = chosenBuyerId ? matches.filter((m: any) => {
    const b = m.buyer ?? m;
    return b && Number(b.id) === chosenBuyerId;
  }) : matches;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="bg-white border rounded p-4">
        <h2 className="text-xl font-bold">{seller.property_address || seller.name}</h2>
        <p className="text-sm text-gray-600">• {seller.owner_contact}</p>
        <p className="mt-2">Type: {seller.property_type}</p>
        <p>Location: {seller.location ?? "—"} • Lat: {seller.lat ?? "—"}, Lng: {seller.lng ?? "—"}</p>
        <p>Price: {seller.price ?? "—"} • Bedrooms: {seller.bedrooms ?? "—"}</p>
        <p>Status: <strong>{seller.status}</strong></p>
      </div>

      <h3 className="mt-8 mb-3 text-lg font-semibold">Potential Buyers ({matches.length})</h3>

      {loadingMatches && <p>Finding potential buyers...</p>}

      <div className="space-y-3">
        {!loadingMatches && matches.length === 0 && <p className="text-sm text-gray-500">No matching buyers found.</p>}

        {visibleMatches.map((m: any) => {
          const buyer = m.buyer ?? m;
          const distance = m.distance_km ?? 0;
          const score = m.score ?? 0;
          const isChosen = chosenBuyerId === buyer.id;

          return (
            <div key={buyer.id} className="border rounded p-3 flex justify-between items-start">
              <div>
                <div className="font-medium">{buyer.name}</div>
                <div className="text-xs text-gray-500">{buyer.email} • {buyer.phone}</div>
                <div className="text-xs mt-1">Requirement: {buyer.requirement ?? "—"}</div>
                <div className="text-xs text-gray-500 mt-1">Distance: {Number(distance).toFixed(2)} km • Score: {score}</div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <a className="text-sm underline" href={`/buyers/${buyer.id}`}>Open</a>

                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkInterested(buyer.id); }}
                  aria-label={isChosen ? "Chosen buyer" : "Mark as interested"}
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 border ${
                    isChosen ? "bg-green-500 text-white border-green-600" : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill={isChosen ? "white" : "currentColor"}>
                    <path d="M12 17.3l6.18 3.73-1.64-7.03L21 9.24l-7.19-.62L12 2 10.19 8.62 3 9.24l4.46 4.76L5.82 21z" />
                  </svg>
                  {isChosen ? "Selected" : "Mark Interested"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {chosenBuyerId && (
        <div className="mt-6 text-sm">
          <p className="text-green-700">You chose buyer ID: {chosenBuyerId}. Other options hidden.</p>
          <button
            onClick={() => {
              if (!confirm("Remove selection locally (does not revert DB).")) return;
              setChosenBuyerId(null);
              setSaving(s => !s);
            }}
            className="mt-2 inline-block px-3 py-1 rounded bg-gray-200 text-gray-800"
          >
            Clear selection (local)
          </button>
        </div>
      )}
    </div>
  );
}
