// app/sellers/new/page.tsx
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
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
    if (!raw) {
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(raw);
    setTenantId(parsed.tenantId || parsed.tenant_id || null);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    setLoading(true);
    setMessage("");

    const payload = {
      property_address: name,
      owner_contact: phone || email,
      email,
      property_type: propertyType || null,
      location,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      price: price ? Number(price) : null,
      bedrooms: bedrooms ? Number(bedrooms) : null,
    };

    try {
      const res = await fetch(`/api/sellers/tenant/${tenantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let j = null;
      try { j = await res.json(); } catch { j = null; }

      if (!res.ok) {
        setMessage(j?.error || `Server error ${res.status}`);
        setLoading(false);
        return;
      }

      router.push("/sellers");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
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
              Property Address <span className="text-red-500">*</span>
            </label>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Property address or title"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">
              Phone / Contact
            </label>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contact number"
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 text-gray-600">Latitude</label>
              <input className="border rounded-xl px-3 py-2 w-full" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="19.07" />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Longitude</label>
              <input className="border rounded-xl px-3 py-2 w-full" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="72.87" />
            </div>
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

          <div>
            <label className="block mb-1 text-gray-600">Bedrooms</label>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              placeholder="e.g. 2"
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
