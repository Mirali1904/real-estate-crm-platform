"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import BackButton from "@/components/BackButton";

export default function AddSellerPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    owner_contact: "",
    email: "",
    property_type: "",
    location: "",
    lat: "",
    lng: "",
    price: "",
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
    const tenantId = user.tenant_id || user.tenantId;

    const res = await fetch("/api/sellers/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tenantId,
        ...form,
      }),
    });

    if (res.ok) {
      router.push("/sellers");
    } else {
      const data = await res.json();
      alert(data?.error || "Failed to save property");
    }
  }

  return (
    <div className="w-full">
      <BackButton />

      {/* ===== CENTER + SLIGHTLY UP ===== */}
     <div className="flex justify-center">
  <div className="w-full max-w-md mt-0">

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-semibold mb-6">
              Add <span className="text-[#c99a2e]">Property / Seller</span>
            </h1>

            <div className="space-y-4">
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

              <Input
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
              />

              <Input
                label="Latitude"
                name="lat"
                value={form.lat}
                onChange={handleChange}
              />

              <Input
                label="Longitude"
                name="lng"
                value={form.lng}
                onChange={handleChange}
              />

              <Input
                label="Price"
                name="price"
                value={form.price}
                onChange={handleChange}
              />

              <Input
                label="Bedrooms"
                name="bedrooms"
                value={form.bedrooms}
                onChange={handleChange}
              />
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

/* ================= INPUT ================= */

function Input({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: any;
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c99a2e]"
      />
    </div>
  );
}
