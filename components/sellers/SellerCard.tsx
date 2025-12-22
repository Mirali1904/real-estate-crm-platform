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
};

export default function SellerCard({
  seller,
  onDelete,
}: {
  seller: Seller;
  onDelete: (id: number) => void;
}) {
  if (!seller) return null;

  const sellerName =
    seller.name ||
    seller.property_address ||
    "Unknown Seller";

  return (
    <div className="flex justify-between items-start border rounded-xl bg-white p-4 hover:shadow-sm">
      <div>
        {/* ✅ SELLER NAME */}
        <p className="font-semibold">{sellerName}</p>

        {seller.email && (
          <p className="text-xs text-gray-500">{seller.email}</p>
        )}
        {seller.phone && (
          <p className="text-xs text-gray-500">{seller.phone}</p>
        )}

        {seller.property_type && (
          <p className="text-xs mt-1 font-medium">
            {seller.property_type}
          </p>
        )}

        {seller.price != null && (
          <p className="text-xs text-[#22a06b] font-semibold mt-1">
            ₹ {seller.price}
          </p>
        )}

        {seller.bedrooms != null && (
          <p className="text-xs text-gray-500 mt-1">
            Bedrooms: {seller.bedrooms}
          </p>
        )}
      </div>

      <SecondaryButton
        onClick={(e: any) => {
          e.stopPropagation();
          e.preventDefault();
          if (!confirm("Delete this property?")) return;
          onDelete(seller.id);
        }}
      >
        Delete
      </SecondaryButton>
    </div>
  );
}
