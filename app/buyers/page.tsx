"use client";

import { useEffect, useState } from "react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";


export default function BuyersPage() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [user, setUser] = useState<any>();

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;
    const parsed = JSON.parse(raw);

    setUser(parsed);

    fetch(`/api/buyers/${parsed.tenantId}`)
      .then((res) => res.json())
      .then((data) => setBuyers(data.buyers));
  }, []);

  const deleteBuyer = async (id: number) => {
    await fetch("/api/buyers/delete", {
      method: "POST",
      body: JSON.stringify({ id, tenantId: user.tenantId }),
      headers: { "Content-Type": "application/json" },
    });

    setBuyers(buyers.filter((x) => x.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Buyer Leads</h1>

      <a href="/buyers/new">
                <PrimaryButton>
                        + Add Buyer
                 </PrimaryButton>
        </a>


      <div className="mt-6 space-y-3">
        {buyers.map((b) => (
          <div
            key={b.id}
            className="flex justify-between items-center border rounded-lg p-3 bg-white"
          >
            <div>
              <p className="font-medium">{b.name}</p>
              <p className="text-xs text-gray-500">{b.email}</p>
              <p className="text-xs text-gray-500">{b.phone}</p>
              <p className="text-xs">{b.requirement}</p>
            </div>

            <SecondaryButton onClick={() => deleteBuyer(b.id)}>
  Delete
</SecondaryButton>

          </div>
        ))}
      </div>
    </div>
  );
}
