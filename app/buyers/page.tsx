"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import BackButton from "@/components/BackButton";
import ShareToGroupModal from "@/components/groups/ShareToGroupModal";

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

  /* ================= FETCH ================= */

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

    fetch(`/api/buyers/tenant/${tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        setBuyers(data);
        setDisplayBuyers(data);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= SEARCH ================= */

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

    const timer = setTimeout(() => {
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
        .then((data) => setDisplayBuyers(data.results || []));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, buyers]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this buyer?")) return;

    await fetch(`/api/buyers/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setBuyers((p) => p.filter((b) => b.id !== id));
    setDisplayBuyers((p) => p.filter((b) => b.id !== id));
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="w-full px-6 pt-3">
      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <BackButton />
          <h1 className="text-2xl font-semibold mt-2">Buyer Leads</h1>
        </div>

        <PrimaryButton onClick={() => router.push("/buyers/new")}>
          + Add Buyer
        </PrimaryButton>
      </div>

      {/* SEARCH BAR (PROFESSIONAL SINGLE LINE) */}
      <div className="mb-4">
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search buyers by name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              h-11
              px-5
              text-sm
              rounded-full
              border
              border-gray-300
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-[#5b5ce2]
              focus:border-[#5b5ce2]
              shadow-sm
            "
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b">
              <th className="px-6 py-3 text-left font-medium">Name</th>
              <th className="px-6 py-3 text-left font-medium">Email</th>
              <th className="px-6 py-3 text-left font-medium">Phone</th>
              <th className="px-6 py-3 text-left font-medium">Budget</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {displayBuyers.map((buyer) => (
              <tr
                key={buyer.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => router.push(`/buyers/${buyer.id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                      {buyer.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {buyer.name}
                      </div>
                      <div className="text-xs text-gray-400">Buyer</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {buyer.email}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {buyer.phone}
                </td>

                <td className="px-6 py-4 text-gray-700">
                  ₹{buyer.budget_min} – ₹{buyer.budget_max}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      buyer.status === "SITE_VISIT"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {buyer.status}
                  </span>
                </td>

                <td
                  className="px-6 py-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end gap-2">
                    <SecondaryButton
                      onClick={() => setShareBuyerId(buyer.id)}
                    >
                      Share
                    </SecondaryButton>

                    <SecondaryButton
                      onClick={() => handleDelete(buyer.id)}
                    >
                      Delete
                    </SecondaryButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SHARE MODAL */}
      {shareBuyerId && (
        <ShareToGroupModal
          open
          onClose={() => setShareBuyerId(null)}
          entityType="buyer"
          entityId={shareBuyerId}
        />
      )}
    </div>
  );
}
