"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSellerPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) {
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(raw);
    setTenantId(parsed.tenantId);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/sellers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        name,
        phone,
        email,
        propertyType,
        location,
        price,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.success) {
      setMessage(data.message || "Failed to add property");
      return;
    }

    router.push("/sellers");
  };

  if (!tenantId) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#f5f5f5]">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-md border border-gray-100 p-8">
        <h1 className="text-xl font-bold mb-4">
          Add <span className="text-[#c89a3b]">Property / Seller</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block mb-1 text-gray-600">
              Seller Name <span className="text-red-500">*</span>
            </label>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Owner name"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contact number"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Email</label>
            <input
              type="email"
              className="border rounded-xl px-3 py-2 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Property Type</label>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              placeholder="2BHK Flat, Shop, Plot..."
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Location</label>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Area / City"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Price</label>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 25000 or 4500000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c89a3b] text-white py-2.5 rounded-full text-sm font-medium hover:bg-[#b4882f] transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Property"}
          </button>
        </form>

        {message && (
          <p className="mt-3 text-xs text-center text-red-500">{message}</p>
        )}
      </div>
    </div>
  );
}
