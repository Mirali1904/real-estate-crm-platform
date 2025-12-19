"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import BackButton from "@/components/BackButton";

/* ---------------- DEBOUNCE HOOK ---------------- */
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

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

  const debouncedLocation = useDebounce(form.location, 600);
  const lastSearchedRef = useRef<string>("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleLocationChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, location: e.target.value });
  }

  /* ---------------- LOCATION SEARCH ---------------- */
  useEffect(() => {
    if (debouncedLocation.length < 3) {
      setSuggestions([]);
      return;
    }

    if (lastSearchedRef.current === debouncedLocation) return;
    lastSearchedRef.current = debouncedLocation;

    const controller = new AbortController();

    async function fetchLocations() {
      setLoadingLocation(true);
      try {
        const res = await fetch(
          `/api/location/search?q=${encodeURIComponent(debouncedLocation)}`,
          { signal: controller.signal }
        );

        const data = await res.json();
        setSuggestions(data);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Location error", err);
        }
      } finally {
        setLoadingLocation(false);
      }
    }

    fetchLocations();
    return () => controller.abort();
  }, [debouncedLocation]);

  function selectLocation(place: any) {
    setForm({
      ...form,
      location: place.display_name,
      lat: place.lat,
      lng: place.lon,
    });
    setSuggestions([]);
  }

  async function handleSubmit() {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) {
      alert("Not logged in");
      return;
    }

    const user = JSON.parse(raw);
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

            <div className="col-span-2 relative">
              <label className="text-sm mb-1 block">Location</label>
              <input
                value={form.location}
                onChange={handleLocationChange}
                className="w-full border rounded-lg px-3 py-2"
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
