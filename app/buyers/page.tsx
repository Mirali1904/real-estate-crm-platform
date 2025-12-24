"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SecondaryButton from "@/components/SecondaryButton";
import BackButton from "@/components/BackButton";
import ShareToGroupModal from "@/components/groups/ShareToGroupModal";

/* ================= TYPES ================= */

type Buyer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  budget_min: number;
  budget_max: number;
  status: string;
};

export default function BuyersPage() {
  const router = useRouter();

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [displayBuyers, setDisplayBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [shareBuyerId, setShareBuyerId] = useState<number | null>(null);

  /* ================= FETCH ALL BUYERS ================= */

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) {
      setLoading(false);
      return;
    }

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

    fetch(`/api/buyers/tenant/${tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        setBuyers(data);
        setDisplayBuyers(data); // default = all buyers
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* ================= DEBOUNCED SEARCH (BACKEND ONLY) ================= */

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

    const timer = setTimeout(() => {
      // 🔹 Search empty → show full list
      if (!search.trim()) {
        setDisplayBuyers(buyers);
        return;
      }

      fetch(
        `/api/buyers/search?tenantId=${tenantId}&q=${encodeURIComponent(
          search.trim()
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          setDisplayBuyers(data.results || []);
        })
        .catch(() => setDisplayBuyers([]));
    }, 400); // ⏳ debounce (VERY IMPORTANT)

    return () => clearTimeout(timer);
  }, [search, buyers]);

  /* ================= DELETE ================= */

  async function handleDelete(id: number) {
    if (!confirm("Delete this buyer?")) return;

    await fetch(`/api/buyers/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setBuyers((prev) => prev.filter((b) => b.id !== id));
    setDisplayBuyers((prev) => prev.filter((b) => b.id !== id));
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="w-full p-6">
      {/* BACK */}
      <div className="mb-4">
        <BackButton />
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Buyer Leads</h1>
        <button
          onClick={() => router.push("/buyers/new")}
          className="bg-[#c99a2e] text-white px-4 py-2 rounded-full"
        >
          + Add Buyer
        </button>
      </div>

      {/* 🔍 SEARCH */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search buyers by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* EMPTY STATE */}
      {displayBuyers.length === 0 && (
        <p className="text-gray-500">No buyers found.</p>
      )}

      {/* LIST */}
      {displayBuyers.map((buyer) => (
        <div
          key={buyer.id}
          className="w-full border rounded-xl p-4 mb-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => router.push(`/buyers/${buyer.id}`)}
        >
          <div>
            <p className="font-semibold">{buyer.name}</p>
            <p className="text-sm text-gray-600">{buyer.email}</p>
            <p className="text-sm text-gray-600">{buyer.phone}</p>
            <p className="text-sm">
              Budget: {buyer.budget_min} - {buyer.budget_max}
            </p>
            <p className="text-sm font-medium">
              Status: <span className="uppercase">{buyer.status}</span>
            </p>
          </div>

          <div
            className="flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShareBuyerId(buyer.id)}
              className="px-3 py-1 text-sm rounded-full border border-[#c99a2e] text-[#c99a2e]"
            >
              Share
            </button>

            <SecondaryButton onClick={() => handleDelete(buyer.id)}>
              Delete
            </SecondaryButton>
          </div>
        </div>
      ))}

      {/* SHARE MODAL */}
      {shareBuyerId !== null && (
        <ShareToGroupModal
          open={true}
          onClose={() => setShareBuyerId(null)}
          entityType="buyer"
          entityId={shareBuyerId}
        />
      )}
    </div>
  );
}
