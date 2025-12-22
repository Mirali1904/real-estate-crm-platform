"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSellerForm({ tenantId }: any) {
  const router = useRouter();

  const [form, setForm] = useState({
    sellerName: "",   // ✅ NEW
    phone: "",
    email: "",
    propertyType: "",
    lat: "",
    lng: "",
    price: "",
    bedrooms: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!tenantId) return;

    const payload = {
      // ✅ seller name yahin bhej rahe hai
      name: form.sellerName,
      property_address: form.sellerName,
      owner_contact: form.phone || form.email,
      email: form.email || null,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      price: form.price ? Number(form.price) : 0,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      property_type: form.propertyType || null,
    };

    const res = await fetch(`/api/sellers/${tenantId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) router.push("/sellers");
    else {
      const j = await res.json().catch(() => ({}));
      alert(j?.error || "Failed to create property");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* ✅ SELLER NAME FIELD */}
      <input
        value={form.sellerName}
        placeholder="Seller Name"
        className="border rounded-lg p-2 w-full"
        onChange={(e) =>
          setForm({ ...form, sellerName: e.target.value })
        }
        required
      />

      <input
        value={form.phone}
        placeholder="Phone / Contact"
        className="border rounded-lg p-2 w-full"
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <input
        value={form.email}
        placeholder="Email"
        className="border rounded-lg p-2 w-full"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        value={form.propertyType}
        placeholder="Property Type"
        className="border rounded-lg p-2 w-full"
        onChange={(e) =>
          setForm({ ...form, propertyType: e.target.value })
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          value={form.lat}
          placeholder="Latitude"
          className="border rounded-lg p-2 w-full"
          onChange={(e) => setForm({ ...form, lat: e.target.value })}
        />
        <input
          value={form.lng}
          placeholder="Longitude"
          className="border rounded-lg p-2 w-full"
          onChange={(e) => setForm({ ...form, lng: e.target.value })}
        />
      </div>

      <input
        value={form.price}
        placeholder="Price"
        className="border rounded-lg p-2 w-full"
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />

      <input
        value={form.bedrooms}
        placeholder="Bedrooms"
        className="border rounded-lg p-2 w-full"
        onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
      />

      <button className="bg-[#c89a3b] w-full py-2 rounded-full text-white">
        Add Seller
      </button>
    </form>
  );
}
