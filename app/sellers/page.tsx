"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import BackButton from "@/components/BackButton";
import ShareToGroupModal from "@/components/groups/ShareToGroupModal";

type Seller = {
  id: number;
  owner_name: string;
  property_type: string;
  price: number;
  bedrooms: number;
  brokerage_amount?: string | null;
  remarks?: string | null;
};

export default function SellersPage() {
  const router = useRouter();

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [displaySellers, setDisplaySellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [shareSellerId, setShareSellerId] = useState<number | null>(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

    fetch(`/api/sellers/tenant/${tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setSellers(data.sellers);
          setDisplaySellers(data.sellers);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!search.trim()) {
      setDisplaySellers(sellers);
      return;
    }

    const q = search.toLowerCase();
    setDisplaySellers(
      sellers.filter(
        (s) =>
          s.owner_name?.toLowerCase().includes(q) ||
          s.property_type?.toLowerCase().includes(q)
      )
    );
  }, [search, sellers]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this property?")) return;
    await fetch(`/api/sellers/${id}`, { method: "DELETE" });
    setSellers((p) => p.filter((s) => s.id !== id));
    setDisplaySellers((p) => p.filter((s) => s.id !== id));
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="w-full px-6 pt-3">
      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <BackButton />
          <h1 className="text-2xl font-semibold mt-2">
            Sellers / Properties
          </h1>
        </div>

        <PrimaryButton onClick={() => router.push("/sellers/new")}>
          + Add Property
        </PrimaryButton>
      </div>

      {/* SEARCH BAR (SAME AS BUYER) */}
      <div className="mb-4">
        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search sellers by name or property type"
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

      {/* TABLE (EXACT BUYER STYLE) */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b">
              <th className="px-6 py-3 text-left font-medium">Name</th>
              <th className="px-6 py-3 text-left font-medium">
                Property Type
              </th>
              <th className="px-6 py-3 text-left font-medium">Price</th>
              <th className="px-6 py-3 text-left font-medium">Beds</th>
              <th className="px-6 py-3 text-left font-medium">
                Brokerage
              </th>
              <th className="px-6 py-3 text-left font-medium">
                Remarks
              </th>
              <th className="px-6 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {displaySellers.map((seller) => (
              <tr
                key={seller.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                onClick={() =>
                  router.push(`/sellers/${seller.id}`)
                }
              >
                {/* NAME */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                      {seller.owner_name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {seller.owner_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        Seller
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {seller.property_type}
                </td>

                <td className="px-6 py-4 text-gray-700">
                  ₹{seller.price}
                </td>

                <td className="px-6 py-4 text-gray-700">
                  {seller.bedrooms} BHK
                </td>

                <td className="px-6 py-4 text-gray-700">
                  {seller.brokerage_amount || "—"}
                </td>

                <td className="px-6 py-4 text-gray-500">
                  {seller.remarks || "—"}
                </td>

                <td
                  className="px-6 py-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-end gap-2">
                    <SecondaryButton
                      onClick={() =>
                        setShareSellerId(seller.id)
                      }
                    >
                      Share
                    </SecondaryButton>

                    <SecondaryButton
                      onClick={() => handleDelete(seller.id)}
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
      {shareSellerId && (
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
