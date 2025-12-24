"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import SellerCard from "@/components/sellers/SellerCard";
import BackButton from "@/components/BackButton";
import ShareToGroupModal from "@/components/groups/ShareToGroupModal";

export default function SellersPage() {
  const router = useRouter();

  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔍 SEARCH STATE
  const [search, setSearch] = useState("");

  // 🔗 SHARE STATE
  const [shareSellerId, setShareSellerId] = useState<number | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) {
      setLoading(false);
      return;
    }

    const user = JSON.parse(raw);

    fetch(`/api/sellers/tenant/${user.tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) setSellers(data.sellers || []);
        else if (Array.isArray(data)) setSellers(data);
        else setSellers([]);
      })
      .catch(() => setSellers([]))
      .finally(() => setLoading(false));
  }, []);

  // ✅ ✅ ✅ SEARCH LOGIC — YAHI CHALTA HAI
  const filteredSellers = sellers.filter((seller) => {
    const q = search.toLowerCase();

    return (
      (seller.name ?? "").toLowerCase().includes(q) ||
      (seller.property_address ?? "").toLowerCase().includes(q) ||
      (seller.property_type ?? "").toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this property?")) return;
    await fetch(`/api/sellers/${id}`, { method: "DELETE" });
    setSellers((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="w-full p-6">
      {/* BACK */}
      <div className="mb-4">
        <BackButton />
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sellers / Properties</h1>
        <PrimaryButton onClick={() => router.push("/sellers/new")}>
          + Add Property
        </PrimaryButton>
      </div>

      {/* 🔍 SEARCH BAR */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search seller name or property type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {filteredSellers.map((seller) => (
          <div
            key={seller.id}
            onClick={() => router.push(`/sellers/${seller.id}`)}
            className="cursor-pointer"
          >
            <SellerCard
              seller={seller}
              onDelete={handleDelete}
              onShare={(id) => setShareSellerId(id)}
            />
          </div>
        ))}

        {filteredSellers.length === 0 && (
          <p className="text-gray-500 text-sm">No sellers found.</p>
        )}
      </div>

      {/* SHARE MODAL */}
      {shareSellerId !== null && (
        <ShareToGroupModal
          open={true}
          onClose={() => setShareSellerId(null)}
          entityType="seller"
          entityId={shareSellerId}
        />
      )}
    </div>
  );
}
