"use client";

import { useEffect, useState } from "react";
import SellerCard from "@/components/sellers/SellerCard";
import PrimaryButton from "@/components/PrimaryButton";

export default function SellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    setUser(parsed);

    fetch(`/api/sellers/${parsed.tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSellers(data.sellers || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (id: number) => {
    if (!user) return;

    await fetch("/api/sellers/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, tenantId: user.tenantId }),
    });

    setSellers((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Sellers / Properties</h1>

      <a href="/sellers/new">
        <PrimaryButton>+ Add Property</PrimaryButton>
      </a>

      <div className="mt-6 space-y-3">
        {sellers.map((seller) => (
          <SellerCard
            key={seller.id}
            seller={seller}
            onDelete={handleDelete}
          />
        ))}

        {sellers.length === 0 && (
          <p className="text-sm text-gray-500">No properties yet.</p>
        )}
      </div>
    </div>
  );
}
