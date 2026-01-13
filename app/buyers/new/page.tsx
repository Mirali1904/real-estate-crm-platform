"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";

/* ---------------- DEBOUNCE HOOK ---------------- */
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
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
    brokerage_amount: "",
    remarks: "",
    agentId: null,
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const debouncedLocation = useDebounce(form.location, 600);
  const lastSearchedRef = useRef<string>("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
        if (err.name !== "AbortError") console.error(err);
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
    if (!raw) return alert("Not logged in");

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id ?? user.tenantId;
    form.agentId = user.id;

    if (!tenantId) return alert("Tenant not found");

    const res = await fetch("/api/buyers/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": String(tenantId),
      },
      body: JSON.stringify(form),
    });

    if (res.ok) router.push("/buyers");
    else {
      const err = await res.json();
      alert(err.error || "Failed");
    }
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/buyers")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Buyers
          </button>

          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
              R
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RealEstateCRM</h1>
              <p className="text-sm text-gray-500">Add New Buyer Lead</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-8">
            {/* Section 1: Basic Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Buyer's full name"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Contact number"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="buyer@example.com"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Requirement *</label>
                  <input
                    name="requirement"
                    value={form.requirement}
                    onChange={handleChange}
                    placeholder="e.g., 2BHK Flat"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Budget & Preferences */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Budget & Preferences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Budget Min (₹)</label>
                  <input
                    name="budget_min"
                    value={form.budget_min}
                    onChange={handleChange}
                    placeholder="e.g., 50,00,000"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Budget Max (₹)</label>
                  <input
                    name="budget_max"
                    value={form.budget_max}
                    onChange={handleChange}
                    placeholder="e.g., 75,00,000"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Bedrooms</label>
                  <input
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Search Radius (km)</label>
                  <input
                    name="radius_km"
                    value={form.radius_km}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2 relative">
                  <label className="text-sm font-medium text-gray-700">Location/Area</label>
                  <input
                    value={form.location}
                    onChange={handleLocationChange}
                    placeholder="e.g., Vastrapur, Ahmedabad"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {loadingLocation && (
                    <p className="text-xs text-gray-500 mt-1">Searching...</p>
                  )}
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 bg-white border border-gray-200 w-full rounded-lg mt-1 max-h-48 overflow-auto shadow-lg">
                      {suggestions.map((place, i) => (
                        <div
                          key={i}
                          onClick={() => selectLocation(place)}
                          className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        >
                          {place.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Location Coordinates */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Location Coordinates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    value={form.lat}
                    readOnly
                    placeholder="e.g., 23.0225"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    value={form.lng}
                    readOnly
                    placeholder="e.g., 72.5714"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Brokerage & Additional Info */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Brokerage & Additional Info
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Brokerage Amount (₹ / %)
                  </label>
                  <input
                    name="brokerage_amount"
                    value={form.brokerage_amount}
                    onChange={handleChange}
                    placeholder="e.g., 2.5% or ₹50,000"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Buyer Remarks / Notes
                  </label>
                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    placeholder="Example: Wants sea-facing flat, call after 10 AM"
                    rows={4}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.push("/buyers")}
                className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Add Buyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}