"use client";

import SecondaryButton from "@/components/SecondaryButton";

type Seller = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  property_type?: string;
  location?: string;
  price?: string | number;
};

export default function SellerCard({
  seller,
  onDelete,
}: {
  seller: Seller;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="flex justify-between items-start border rounded-xl bg-white p-4">
      <div>
        <p className="font-medium">{seller.name}</p>
        {seller.email && (
          <p className="text-xs text-gray-500">{seller.email}</p>
        )}
        {seller.phone && (
          <p className="text-xs text-gray-500">{seller.phone}</p>
        )}

        {(seller.property_type || seller.location) && (
          <p className="text-xs mt-1">
            <span className="font-semibold">
              {seller.property_type || "Property"}
            </span>
            {seller.location ? ` @ ${seller.location}` : ""}
          </p>
        )}

        {seller.price && (
          <p className="text-xs text-[#22a06b] font-semibold mt-1">
            ₹ {seller.price}
          </p>
        )}
      </div>

      <SecondaryButton onClick={() => onDelete(seller.id)}>
        Delete
      </SecondaryButton>
    </div>
  );
}
