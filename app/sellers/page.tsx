"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import SellerCard from "@/components/sellers/SellerCard";
import BackButton from "@/components/BackButton";

export default function SellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("loggedUser")
        : null;
    if (!raw) return;

    const parsed = JSON.parse(raw);
    setUser(parsed);

    fetch(`/api/sellers/tenant/${parsed.tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) setSellers(data.sellers || []);
        else if (Array.isArray(data)) setSellers(data);
        else setSellers([]);
      })
      .catch((err) => {
        console.error("fetch sellers", err);
        setSellers([]);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (!user) return;
    try {
      await fetch(`/api/sellers/${id}`, { method: "DELETE" });
      setSellers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("delete seller error", err);
    }
  };

  const openSeller = (id: number) => {
    router.push(`/sellers/${id}`);
  };

  return (
    <div className="w-full">
      {/* CENTER CONTAINER */}
      <div className="max-w-5xl mx-auto p-6">
        {/* BACK BUTTON */}
        <div className="mb-4">
          <BackButton />
        </div>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sellers / Properties</h1>
          <a href="/sellers/new">
            <PrimaryButton>+ Add Property</PrimaryButton>
          </a>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              role="button"
              tabIndex={0}
              onClick={() => openSeller(seller.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  openSeller(seller.id);
              }}
              className="cursor-pointer"
            >
              <SellerCard seller={seller} onDelete={handleDelete} />
            </div>
          ))}

          {sellers.length === 0 && (
            <p className="text-sm text-gray-500">
              No properties yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
