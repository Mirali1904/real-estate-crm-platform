"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SecondaryButton from "@/components/SecondaryButton";
import BackButton from "@/components/BackButton";

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
  const tenantId = 1;

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/buyers/tenant/${tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        setBuyers(data.buyers || []);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this buyer?")) return;

    await fetch(`/api/buyers/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setBuyers((prev) => prev.filter((b) => b.id !== id));
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="w-full">
      {/* CENTER CONTAINER */}
      <div className="max-w-5xl mx-auto p-6">
        {/* BACK */}
        <div className="mb-4">
          <BackButton />
        </div>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Buyer Leads</h1>
          <button
            onClick={() => router.push("/buyers/new")}
            className="bg-[#c99a2e] text-white px-4 py-2 rounded-full"
          >
            + Add Buyer
          </button>
        </div>

        {/* LIST */}
        {buyers.map((buyer) => (
          <div
            key={buyer.id}
            className="border rounded-xl p-4 mb-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
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

            <div onClick={(e) => e.stopPropagation()}>
              <SecondaryButton onClick={() => handleDelete(buyer.id)}>
                Delete
              </SecondaryButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
