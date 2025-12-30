"use client";

import SecondaryButton from "@/components/SecondaryButton";

type Seller = {
  id: number;
  name?: string;
  property_address?: string;
  phone?: string;
  email?: string;
  property_type?: string;
  location?: string;
  price?: string | number;
  bedrooms?: number | null;

  // ✅ NEW
  brokerage_amount?: string | null;
  remarks?: string | null;
};

export default function SellerCard({
  seller,
  onDelete,
  onShare,
}: {
  seller: Seller;
  onDelete: (id: number) => void;
  onShare: (id: number) => void;
}) {
  if (!seller) return null;

  const sellerName =
    seller.name ||
    seller.property_address ||
    "Unknown Seller";

  return (
    <div className="flex justify-between items-start border rounded-xl bg-white p-4 hover:shadow-sm">
      {/* LEFT */}
      <div>
        <p className="font-semibold">{sellerName}</p>

        {seller.property_type && (
          <p className="text-xs mt-1">{seller.property_type}</p>
        )}

        {seller.price != null && (
          <p className="text-xs text-[#22a06b] font-semibold">
            ₹ {seller.price}
          </p>
        )}

        {seller.bedrooms != null && (
          <p className="text-xs text-gray-500">
            Bedrooms: {seller.bedrooms}
          </p>
        )}

        {/* ✅ NEW */}
        {seller.brokerage_amount && (
          <p className="text-xs text-gray-500">
            Brokerage: {seller.brokerage_amount}
          </p>
        )}

        {seller.remarks && (
          <p className="text-xs text-gray-400 truncate max-w-xs">
            {seller.remarks}
          </p>
        )}
      </div>

      {/* RIGHT */}
      <div
        className="flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onShare(seller.id)}
          className="px-3 py-1 text-sm rounded-full border border-[#c99a2e] text-[#c99a2e]"
        >
          Share
        </button>

        <SecondaryButton
          onClick={(e: any) => {
            e.preventDefault();
            if (!confirm("Delete this property?")) return;
            onDelete(seller.id);
          }}
        >
          Delete
        </SecondaryButton>
      </div>
    </div>
  );
}
