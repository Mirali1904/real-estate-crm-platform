"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import BackButton from "@/components/BackButton";

export default function AddSellerPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    seller_name: "", // ✅ NEW
    owner_contact: "",
    email: "",
    property_type: "",
    location: "",
    lat: "",
    lng: "",
    price: "",
    bedrooms: "",
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ---------------- LOCATION ---------------- */
  function handleLocationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setForm({ ...form, location: value });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setLoadingLocation(true);
        const res = await fetch(
          `/api/location/search?q=${encodeURIComponent(value)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoadingLocation(false);
      }
    }, 600);
  }

  function selectLocation(place: any) {
    setForm({
      ...form,
      location: place.display_name,
      lat: place.lat,
      lng: place.lon,
    });
    setSuggestions([]);
  }

  /* ---------------- SUBMIT ---------------- */
  async function handleSubmit() {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) {
      alert("Not logged in");
      return;
    }

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;
    if (!tenantId) {
      alert("Tenant not found");
      return;
    }

    const res = await fetch("/api/sellers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        name: form.seller_name, // ✅ IMPORTANT
        owner_contact: form.owner_contact,
        email: form.email,
        property_type: form.property_type,
        location: form.location,
        lat: form.lat,
        lng: form.lng,
        price: form.price,
        bedrooms: form.bedrooms,
      }),
    });

    if (res.ok) router.push("/sellers");
    else {
      const data = await res.json();
      alert(data?.error || "Failed to save property");
    }
  }

  return (
    <div className="w-full">
      <BackButton />

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-semibold mb-6">
              Add <span className="text-[#c99a2e]">Property / Seller</span>
            </h1>

            <div className="space-y-4">
              {/* ✅ SELLER NAME */}
              <Input
                label="Seller Name"
                name="seller_name"
                value={form.seller_name}
                onChange={handleChange}
              />

              <Input
                label="Phone / Contact"
                name="owner_contact"
                value={form.owner_contact}
                onChange={handleChange}
              />

              <Input
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />

              <Input
                label="Property Type"
                name="property_type"
                value={form.property_type}
                onChange={handleChange}
              />

              {/* LOCATION */}
              <div className="relative">
                <Input
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleLocationChange}
                />

                {loadingLocation && (
                  <p className="text-xs text-gray-500 mt-1">Searching...</p>
                )}

                {suggestions.length > 0 && (
                  <div className="absolute z-10 bg-white border w-full rounded-lg max-h-48 overflow-auto">
                    {suggestions.map((place, i) => (
                      <div
                        key={i}
                        onClick={() => selectLocation(place)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {place.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Input label="Latitude" name="lat" value={form.lat} onChange={handleChange} />
              <Input label="Longitude" name="lng" value={form.lng} onChange={handleChange} />
              <Input label="Price" name="price" value={form.price} onChange={handleChange} />
              <Input label="Bedrooms" name="bedrooms" value={form.bedrooms} onChange={handleChange} />
            </div>

            <div className="flex justify-end mt-6">
              <PrimaryButton onClick={handleSubmit}>
                Save Property
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* INPUT */
function Input({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}
