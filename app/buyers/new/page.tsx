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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    const raw = localStorage.getItem("loggedUser");

    if (!raw) {
      alert("Not logged in");
      return;
    }

    const user = JSON.parse(raw);

    // ✅ SAFE TENANT RESOLUTION
    const tenantId =
      user.tenant_id ||
      user.tenantId ||
      user.tenant?.id ||
      null;

    if (!tenantId) {
      alert("Tenant not found for this user");
      return;
    }

    const res = await fetch("/api/buyers/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": String(tenantId), // ✅ NOW GUARANTEED
      },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        email: form.email,
        requirement: form.requirement,
        location: form.location,
        lat: form.lat,
        lng: form.lng,
        radius_km: form.radius_km,
        budget_min: form.budget_min,
        budget_max: form.budget_max,
        bedrooms: form.bedrooms,
      }),
    });

    if (res.ok) {
      router.push("/buyers");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create buyer");
    }
  }

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-semibold mb-6">Add Buyer</h1>

          <div className="grid grid-cols-2 gap-6">
            <Input label="Name" name="name" onChange={handleChange} />
            <Input label="Phone" name="phone" onChange={handleChange} />
            <Input label="Email" name="email" onChange={handleChange} />
            <Input label="Requirement" name="requirement" onChange={handleChange} />
            <Input label="Location" name="location" onChange={handleChange} />
            <Input label="Latitude" name="lat" onChange={handleChange} />
            <Input label="Longitude" name="lng" onChange={handleChange} />
            <Input label="Radius (km)" name="radius_km" onChange={handleChange} />
            <Input label="Budget Min" name="budget_min" onChange={handleChange} />
            <Input label="Budget Max" name="budget_max" onChange={handleChange} />
            <Input label="Bedrooms" name="bedrooms" onChange={handleChange} />
          </div>

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
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        onChange={onChange}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}
