"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import BackButton from "@/components/BackButton";
import ShareToGroupModal from "@/components/groups/ShareToGroupModal";

export default function SellersPage() {
  const router = useRouter();

  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shareSellerId, setShareSellerId] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);

    fetch(`/api/sellers/tenant/${user.tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setSellers(data.sellers || []);
        else if (Array.isArray(data)) setSellers(data);
        else setSellers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredSellers = sellers.filter((seller) => {
    const q = search.toLowerCase();
    return (
      (seller.name ?? "").toLowerCase().includes(q) ||
      (seller.property_type ?? "").toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this property?")) return;
    await fetch(`/api/sellers/${id}`, { method: "DELETE" });
    setSellers((p) => p.filter((s) => s.id !== id));
  };

  if (loading) return <p className="px-6 pt-4">Loading...</p>;

  return (
    <div className="w-full px-6 pt-2">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <BackButton />
          <h1 className="text-2xl font-semibold mt-3">
            Sellers / Properties
          </h1>
        </div>

        <PrimaryButton onClick={() => router.push("/sellers/new")}>
          + Add Property
        </PrimaryButton>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search sellers by name or property type"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 text-sm border rounded-full focus:outline-none"
        />
      </div>

      {/* ===== HEADER ROW (Buyer style) ===== */}
      <div className="grid grid-cols-12 px-4 py-2 text-xs text-gray-400 border-b border-gray-300">
        <div className="col-span-4">Name</div>
        <div className="col-span-3">Property Type</div>
        <div className="col-span-2">Price</div>
        <div className="col-span-1">Beds</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* ===== ROWS (Buyer style) ===== */}
      {filteredSellers.map((seller) => (
        <div
          key={seller.id}
          onClick={() => router.push(`/sellers/${seller.id}`)}
          className="grid grid-cols-12 px-4 py-4 items-center text-sm hover:bg-gray-50 cursor-pointer"
        >
          {/* NAME */}
          <div className="col-span-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-semibold">
              {seller.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
             <p className="font-medium text-gray-900">
  {seller.owner_name}
</p>

              <p className="text-xs text-gray-400">Seller</p>
            </div>
          </div>

          {/* PROPERTY TYPE */}
          <div className="col-span-3 text-gray-700">
            {seller.property_type || "Property"}
          </div>

          {/* PRICE */}
          <div className="col-span-2 text-gray-700">
            ₹{seller.price}
          </div>

          {/* BEDROOMS */}
          <div className="col-span-1 text-gray-700">
            {seller.bedrooms} BHK
          </div>

          {/* ACTIONS */}
          <div
            className="col-span-2 flex justify-end gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <SecondaryButton
              onClick={() => setShareSellerId(seller.id)}
            >
              Share
            </SecondaryButton>

            <SecondaryButton
              onClick={() => handleDelete(seller.id)}
            >
              Delete
            </SecondaryButton>
          </div>
        </div>
      ))}

      {filteredSellers.length === 0 && (
        <p className="px-4 py-6 text-sm text-gray-500">
          No sellers found.
        </p>
      )}

      {/* ===== SHARE MODAL ===== */}
      {shareSellerId !== null && (
        <ShareToGroupModal
          open
          onClose={() => setShareSellerId(null)}
          entityType="seller"
          entityId={shareSellerId}
        />
      )}
    </div>
  );
}
