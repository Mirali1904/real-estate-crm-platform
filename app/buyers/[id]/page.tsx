// app/buyers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/**
 * Buyer detail + matches page (full component).
 * - When user clicks "Mark Interested" for a seller:
 *    * updates buyer: status=WON, selected_seller_id = sellerId
 *    * updates seller: status=SOLD
 * - Shows chosen seller and hides others after success.
 */

export default function BuyerDetailPage() {
  const params: any = useParams();
  const buyerId = params?.id;

  const [tenantId, setTenantId] = useState<number | null>(null);
  const [buyer, setBuyer] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingBuyer, setLoadingBuyer] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chosenSellerId, setChosenSellerId] = useState<number | null>(null);

  // get tenant from localStorage
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

  // fetch buyer
  useEffect(() => {
    if (!buyerId) return;
    setLoadingBuyer(true);
    fetch(`/api/buyers/${buyerId}`)
      .then(r => r.json())
      .then(d => {
        if (!d) return;
        // route returns buyer object (either {success:true,buyer} or raw buyer)
        if (d.success && d.buyer) {
          setBuyer(d.buyer);
          if (d.buyer.selected_seller_id) setChosenSellerId(Number(d.buyer.selected_seller_id));
        } else if (d.id) {
          setBuyer(d);
          if (d.selected_seller_id) setChosenSellerId(Number(d.selected_seller_id));
        } else {
          setBuyer(d);
        }
      })
      .catch(err => {
        console.error("fetch buyer", err);
        setBuyer(null);
      })
      .finally(() => setLoadingBuyer(false));
  }, [buyerId, saving]);

  // fetch matches
  useEffect(() => {
    if (!buyerId) return;
    const t = tenantId ?? new URL(window.location.href).searchParams.get("tenantId");
    if (!t) {
      setMatches([]);
      return;
    }
    setLoadingMatches(true);
    fetch(`/api/buyers/${buyerId}/matches?tenantId=${t}`)
      .then(r => r.json())
      .then(d => {
        if (!d) return setMatches([]);
        if (d.success && Array.isArray(d.matches)) setMatches(d.matches);
        else if (Array.isArray(d)) setMatches(d);
        else setMatches([]);
      })
      .catch(err => {
        console.error("fetch matches", err);
        setMatches([]);
      })
      .finally(() => setLoadingMatches(false));
  }, [buyerId, tenantId, saving]);

  if (loadingBuyer) return <div className="p-6">Loading buyer...</div>;
  if (!buyer) return <div className="p-6">Buyer not found.</div>;

  async function updateBuyer(fields: Record<string, any>) {
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

  async function updateSeller(sellerId: number, fields: Record<string, any>) {
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

  // Handle marking interest on a seller
  async function handleMarkInterested(sellerId: number) {
    if (chosenSellerId === sellerId) {
      if (!confirm("Do you want to remove your interest selection? This will not revert DB statuses.")) return;
      setChosenSellerId(null);
      return;
    }

    if (!confirm("Mark this property as the one you're interested in? This will update buyer and seller statuses.")) return;

    setSaving(true);
    // optimistic UI: set immediately
    setChosenSellerId(sellerId);

    try {
      // 1) update buyer: set status=WON, selected_seller_id = sellerId
      await updateBuyer({ status: "WON", selected_seller_id: sellerId });

      // 2) update seller: set status=SOLD
      await updateSeller(sellerId, { status: "SOLD" });

      // refresh lists by toggling saving
      setSaving(s => !s);
      alert("Selection saved: buyer set to WON and property marked SOLD.");
    } catch (err) {
      console.error("save selection failed", err);
      setChosenSellerId(null);
      alert("Failed to save selection. See console for details.");
    } finally {
      setSaving(false);
    }
  }

  // If chosenSellerId exists, show only that match; else show all
  const visibleMatches = chosenSellerId ? matches.filter((m: any) => {
    const s = m.seller ?? m;
    return s && s.id === chosenSellerId;
  }) : matches;

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

      {loadingMatches && <p>Finding matches...</p>}

      <div className="space-y-3">
        {!loadingMatches && matches.length === 0 && <p className="text-sm text-gray-500">No matches found.</p>}

        {visibleMatches.map((m: any) => {
          const seller = m.seller ?? m;
          const distance = m.distance_km ?? 0;
          const score = m.score ?? 0;
          const isChosen = chosenSellerId === seller.id;

          return (
            <div key={seller.id} className="border rounded p-3 flex justify-between items-start">
              <div>
                <div className="font-medium">{seller.property_type || seller.property_address || seller.name || "Property"}</div>
                <div className="text-xs text-gray-500">{seller.property_address ?? seller.location}</div>
                <div className="text-xs mt-1">Bedrooms: {seller.bedrooms ?? "—"}</div>
                <div className="text-xs text-gray-500 mt-1">Distance: {Number(distance).toFixed(2)} km • Score: {score}</div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <a className="text-sm underline" href={`/sellers/${seller.id}`}>Open</a>

                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkInterested(seller.id); }}
                  aria-label={isChosen ? "Chosen property" : "Mark as interested"}
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 border ${
                    isChosen ? "bg-green-500 text-white border-green-600" : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill={isChosen ? "white" : "currentColor"}>
                    <path d="M12 17.3l6.18 3.73-1.64-7.03L21 9.24l-7.19-.62L12 2 10.19 8.62 3 9.24l4.46 4.76L5.82 21z" />
                  </svg>
                  {isChosen ? "Interested" : "Mark Interested"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {chosenSellerId && (
        <div className="mt-6 text-sm">
          <p className="text-green-700">You chose property ID: {chosenSellerId}. Other options hidden.</p>
          <button
            onClick={() => {
              if (!confirm("Remove selection locally (does not revert DB).")) return;
              setChosenSellerId(null);
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
