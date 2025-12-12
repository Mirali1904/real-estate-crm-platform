// app/buyers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [user, setUser] = useState<any>();
  const router = useRouter();

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
    if (!raw) return;
    const parsed = JSON.parse(raw);
    setUser(parsed);

    fetch(`/api/buyers/tenant/${parsed.tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) setBuyers(data.buyers || []);
        else if (Array.isArray(data)) setBuyers(data);
        else setBuyers([]);
      })
      .catch((err) => {
        console.error("fetch buyers", err);
        setBuyers([]);
      });
  }, []);

  const deleteBuyer = async (id: number) => {
    try {
      await fetch(`/api/buyers/${id}`, { method: "DELETE" });
      setBuyers((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error("delete buyer error", err);
    }
  };

  const openBuyer = (id: number) => {
    router.push(`/buyers/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Buyer Leads</h1>

      <a href="/buyers/new">
        <PrimaryButton>+ Add Buyer</PrimaryButton>
      </a>

      <div className="mt-6 space-y-3">
        {buyers.map((b) => (
          <div
            key={b.id}
            role="button"
            tabIndex={0}
            onClick={() => openBuyer(b.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openBuyer(b.id);
            }}
            className="flex justify-between items-center border rounded-lg p-3 bg-white cursor-pointer hover:shadow-sm"
          >
            <div>
              <div className="font-medium text-base">{b.name}</div>
              <p className="text-xs text-gray-500">{b.email}</p>
              <p className="text-xs text-gray-500">{b.phone}</p>
              {b.requirement && <p className="text-xs mt-1">{b.requirement}</p>}
              {b.lat && b.lng && (
                <p className="text-xs text-gray-500 mt-1">Location: {b.lat}, {b.lng}</p>
              )}
              {b.budget_min != null && b.budget_max != null && (
                <p className="text-xs mt-1">Budget: {Number(b.budget_min).toFixed(2)} - {Number(b.budget_max).toFixed(2)}</p>
              )}
              <p className="text-xs mt-1">Status: <strong>{b.status}</strong></p>
            </div>

            <div>
              <SecondaryButton
                onClick={(e: any) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!confirm("Delete this buyer?")) return;
                  deleteBuyer(b.id);
                }}
              >
                Delete
              </SecondaryButton>
            </div>
          </div>
        ))}

        {buyers.length === 0 && <p className="text-sm text-gray-500">No buyers yet.</p>}
      </div>
    </div>
  );
}
