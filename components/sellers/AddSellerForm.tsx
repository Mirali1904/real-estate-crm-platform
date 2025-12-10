"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddSellerForm({ tenantId }: any) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    propertyType: "",
    location: "",
    price: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/sellers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, ...form }),
    });

    if (res.ok) router.push("/sellers");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {Object.keys(form).map((key) => (
        <input
          key={key}
          value={(form as any)[key]}
          placeholder={key}
          className="border rounded-lg p-2 w-full"
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      ))}

      <button className="bg-[#c89a3b] w-full py-2 rounded-full text-white">Add Seller</button>
    </form>
  );
}
