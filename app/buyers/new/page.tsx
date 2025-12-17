"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import BackButton from "@/components/BackButton";

export default function AddBuyerPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    requirement: "",
    location: "",
    lat: "",
    lng: "",
    radius_km: "",
    budget_min: "",
    budget_max: "",
    bedrooms: "",
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ---------------- LOCATION AUTOCOMPLETE ---------------- */

  async function handleLocationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setForm({ ...form, location: value });

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoadingLocation(true);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
    );

    const data = await res.json();
    setSuggestions(data);
    setLoadingLocation(false);
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

  // ✅ FIX: tenantId correct read
  const tenantId = user.tenant_id ?? user.tenantId;

  if (!tenantId) {
    alert("Tenant not found");
    return;
  }

  const res = await fetch("/api/buyers/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": String(tenantId),
    },
    body: JSON.stringify(form),
  });

  if (res.ok) {
    alert("Buyer created");
    router.push("/buyers");
  } else {
    const err = await res.json();
    alert(err.error || "Failed");
  }
}


  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto p-6">
        <BackButton />

        <div className="bg-white rounded-2xl shadow-lg p-8 mt-4">
          <h1 className="text-2xl font-semibold mb-6">Add Buyer</h1>

          <div className="grid grid-cols-2 gap-6">
            <Input label="Name" name="name" onChange={handleChange} />
            <Input label="Phone" name="phone" onChange={handleChange} />
            <Input label="Email" name="email" onChange={handleChange} />
            <Input label="Requirement" name="requirement" onChange={handleChange} />

            {/* LOCATION AUTOCOMPLETE */}
            <div className="col-span-2 relative">
              <label className="text-sm mb-1 block">Location</label>
              <input
                value={form.location}
                onChange={handleLocationChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Type area name (e.g. Manjalpur)"
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

            <Input label="Latitude" value={form.lat} readOnly />
            <Input label="Longitude" value={form.lng} readOnly />
            <Input label="Radius (km)" name="radius_km" onChange={handleChange} />
            <Input label="Budget Min" name="budget_min" onChange={handleChange} />
            <Input label="Budget Max" name="budget_max" onChange={handleChange} />
            <Input label="Bedrooms" name="bedrooms" onChange={handleChange} />
          </div>

          <div className="flex justify-end mt-6">
            <PrimaryButton onClick={handleSubmit}>
              Save Buyer
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- INPUT ---------------- */

function Input({ label, name, onChange, value, readOnly = false }: any) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        name={name}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}
