"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import BackButton from "@/components/BackButton";

export default function AddBuyerPage() {
  const router = useRouter();
  const tenantId = 1;

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    const payload = {
      tenant_id: tenantId,
      name: form.name,
      phone: form.phone,
      email: form.email,
      requirement: form.requirement,
      location: form.location,
      lat: Number(form.lat),
      lng: Number(form.lng),
      radius_km: Number(form.radius_km),
      budget_min: Number(form.budget_min),
      budget_max: Number(form.budget_max),
      bedrooms: Number(form.bedrooms),
    };

    const res = await fetch("/api/buyers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/buyers");
    } else {
      alert("Failed to save buyer");
    }
  }

  return (
    <div className="w-full">
      {/* CENTER WRAPPER */}
      <div className="max-w-5xl mx-auto p-6">
        {/* BACK BUTTON */}
        <div className="mb-4">
          <BackButton />
        </div>

        {/* FORM CARD */}
        <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-semibold mb-1">
            Add <span className="text-[#c99a2e]">Buyer</span>
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter buyer preferences and budget details
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-4">
              <Input label="Buyer Name" name="name" onChange={handleChange} />
              <Input label="Phone Number" name="phone" onChange={handleChange} />
              <Input label="Email" name="email" onChange={handleChange} />
              <Input
                label="Requirement (e.g. 2BHK Flat)"
                name="requirement"
                onChange={handleChange}
              />
              <Input
                label="Preferred Location"
                name="location"
                onChange={handleChange}
              />
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Latitude" name="lat" onChange={handleChange} />
                <Input label="Longitude" name="lng" onChange={handleChange} />
              </div>

              <Input
                label="Search Radius (km)"
                name="radius_km"
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Budget Min (₹)"
                  name="budget_min"
                  onChange={handleChange}
                />
                <Input
                  label="Budget Max (₹)"
                  name="budget_max"
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Bedrooms"
                name="bedrooms"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ACTION */}
          <div className="flex justify-end mt-8">
            <PrimaryButton onClick={handleSubmit}>
              Save Buyer
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------
   Reusable Input
----------------------------------- */
function Input({
  label,
  name,
  onChange,
}: {
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        name={name}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c99a2e]"
      />
    </div>
  );
}
