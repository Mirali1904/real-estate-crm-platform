"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import BackButton from "@/components/BackButton";

export default function AddSellerPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    seller_name: "",
    owner_contact: "",
    email: "",
    property_type: "",
    location: "",
    lat: "",
    lng: "",
    price: "",
    bedrooms: "",

    // 🔹 NEW (same as buyer)
    brokerage_amount: "",
    remarks: "",
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* -------- LOCATION SEARCH (UNCHANGED) -------- */
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
        setSuggestions(await res.json());
      } catch {}
      finally {
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

  /* -------- SUBMIT -------- */
  async function handleSubmit() {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return alert("Not logged in");

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

    const res = await fetch("/api/sellers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        name: form.seller_name,
        owner_contact: form.owner_contact,
        email: form.email,
        property_type: form.property_type,
        location: form.location,
        lat: form.lat,
        lng: form.lng,
        price: form.price,
        bedrooms: form.bedrooms,

        // 🔹 NEW
        brokerage_amount: form.brokerage_amount,
        remarks: form.remarks,
      }),
    });

    if (res.ok) router.push("/sellers");
    else alert("Failed to save property");
  }

  return (
    <div className="w-full px-6 pt-2">
      <BackButton />

      {/* ===== CARD (Buyer-style) ===== */}
      <div className="flex justify-center mt-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-lg font-semibold mb-6">
            Add Property
          </h1>

          {/* ===== GRID ===== */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Seller Name"
              name="seller_name"
              value={form.seller_name}
              onChange={handleChange}
            />
            <Field
              label="Phone"
              name="owner_contact"
              value={form.owner_contact}
              onChange={handleChange}
            />

            <Field
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            <Field
              label="Property Type"
              name="property_type"
              value={form.property_type}
              onChange={handleChange}
            />

            {/* 🔹 BROKERAGE */}
            <Field
              label="Brokerage Amount (₹ / %)"
              name="brokerage_amount"
              value={form.brokerage_amount}
              onChange={handleChange}
            />

            {/* 🔹 REMARKS */}
            <Textarea
              label="Seller Remarks / Notes"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
            />

            {/* LOCATION */}
            <div className="col-span-2 relative">
              <Field
                label="Location"
                name="location"
                value={form.location}
                onChange={handleLocationChange}
              />

              {loadingLocation && (
                <p className="text-xs text-gray-400 mt-1">
                  Searching…
                </p>
              )}

              {suggestions.length > 0 && (
                <div className="absolute z-10 bg-white border rounded-lg w-full mt-1 max-h-48 overflow-auto">
                  {suggestions.map((p, i) => (
                    <div
                      key={i}
                      onClick={() => selectLocation(p)}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {p.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Field
              label="Latitude"
              name="lat"
              value={form.lat}
              onChange={handleChange}
            />
            <Field
              label="Longitude"
              name="lng"
              value={form.lng}
              onChange={handleChange}
            />

            <Field
              label="Price"
              name="price"
              value={form.price}
              onChange={handleChange}
            />
            <Field
              label="Bedrooms"
              name="bedrooms"
              value={form.bedrooms}
              onChange={handleChange}
            />
          </div>

          {/* ===== ACTION ===== */}
          <div className="flex justify-end mt-6">
            <PrimaryButton onClick={handleSubmit}>
              Save Property
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== INPUT ===== */
function Field({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full rounded-lg border border-gray-200
          px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      />
    </div>
  );
}

/* ===== TEXTAREA ===== */
function Textarea({ label, name, value, onChange }: any) {
  return (
    <div className="col-span-2">
      <label className="text-xs text-gray-500 mb-1 block">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="
          w-full rounded-lg border border-gray-200
          px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
        placeholder="Example: Exclusive seller, price negotiable till 95L"
      />
    </div>
  );
}
