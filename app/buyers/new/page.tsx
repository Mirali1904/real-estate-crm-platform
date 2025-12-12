// app/buyers/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LoggedUser = {
  id: number;
  tenantId?: number;
  tenant_id?: number;
  name: string;
  email: string;
  role: string;
};

export default function BuyerCreatePage() {
  const router = useRouter();

  const [user, setUser] = useState<LoggedUser | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requirement, setRequirement] = useState("");
  const [location, setLocation] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radiusKm, setRadiusKm] = useState("5");
  const [bedrooms, setBedrooms] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;

    if (!raw) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as LoggedUser;
      setUser(parsed);
    } catch (err) {
      console.error(err);
      router.replace("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const tenantId = user.tenantId ?? user.tenant_id;
    if (!tenantId) {
      setMessage("No tenant found. Please login again.");
      return;
    }

    if (!name.trim()) {
      setMessage("Name is required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        name,
        phone,
        email,
        requirement,
        location,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        radius_km: radiusKm ? Number(radiusKm) : 5,
        budget_min: budgetMin ? Number(budgetMin) : null,
        budget_max: budgetMax ? Number(budgetMax) : null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
      };

      const res = await fetch(`/api/buyers/tenant/${tenantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // safe JSON parse
      let j = null;
      try { j = await res.json(); } catch (err) { j = null; }

      if (!res.ok) {
        setMessage(j?.error || `Server error ${res.status}`);
        setLoading(false);
        return;
      }

      setMessage("Buyer created successfully");
      // redirect to buyers list
      router.push("/buyers");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#f5f5f5]">
      <div className="max-w-xl w-full bg-white border border-gray-100 shadow-md rounded-3xl p-8">
        <h1 className="text-2xl font-bold mb-2">
          Add <span className="text-[#c89a3b]">Buyer</span>
        </h1>
        <p className="text-xs text-gray-500 mb-6">
          Capture buyer details and requirements to start tracking as a lead.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 text-gray-600">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
              placeholder="Buyer full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-600">Phone</label>
              <input
                className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
                placeholder="Contact number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Email</label>
              <input
                type="email"
                className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Requirement</label>
            <input
              className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
              placeholder="e.g. 2BHK flat, semi-furnished"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-600">Preferred Location</label>
              <input
                className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
                placeholder="Area / locality"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Bedrooms</label>
              <input
                type="number"
                className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
                placeholder="e.g. 2"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-600">Latitude</label>
              <input
                className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
                placeholder="19.0760"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Longitude</label>
              <input
                className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
                placeholder="72.8777"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-gray-600">Radius (km)</label>
              <input
                type="number"
                className="border rounded-xl px-3 py-2 w-full"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Budget Min</label>
              <input
                type="number"
                className="border rounded-xl px-3 py-2 w-full"
                placeholder="e.g. 2000000"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Budget Max</label>
              <input
                type="number"
                className="border rounded-xl px-3 py-2 w-full"
                placeholder="e.g. 3000000"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c89a3b] text-white py-2.5 rounded-full font-medium hover:bg-[#b4882f] transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Buyer"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-xs text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
