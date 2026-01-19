"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
} from "lucide-react";

import PrimaryButton from "@/components/PrimaryButton";
import BackButton from "@/components/BackButton";
import dynamic from "next/dynamic";

const SellerLocationMap = dynamic(
  () => import("@/components/SellerLocationMap"),
  { ssr: false }
);


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
    brokerage_amount: "",

    agentId: null as number | null,
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});


  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ===== LOCATION SEARCH (UNCHANGED) ===== */
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
      } catch { }
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

  function validateForm() {
    const newErrors: Record<string, string> = {};

    // Seller Name
    if (!form.seller_name.trim()) {
      newErrors.seller_name = "Seller name is required";
    }

    // Phone
    if (!form.owner_contact.trim()) {
      newErrors.owner_contact = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.owner_contact)) {
      newErrors.owner_contact = "Enter valid 10 digit phone number";
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }

    // Property Type
    if (!form.property_type.trim()) {
      newErrors.property_type = "Property type is required";
    }

    // Price
    if (!form.price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(form.price))) {
      newErrors.price = "Price must be a number";
    }

    // Bedrooms
    if (form.bedrooms && isNaN(Number(form.bedrooms))) {
      newErrors.bedrooms = "Bedrooms must be a number";
    }

    // Brokerage
    if (
      form.brokerage_amount &&
      form.brokerage_amount.length < 2
    ) {
      newErrors.brokerage_amount = "Enter valid brokerage amount";
    }

    // Location
    if (!form.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!form.lat || !form.lng) {
      newErrors.location = "Please select location from suggestions or map";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }


  /* ===== SUBMIT (UNCHANGED) ===== */
  async function handleSubmit() {

    if (!validateForm()) return; //  STOP if invalid
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return alert("Not logged in");

    const user = JSON.parse(raw);
    const tenantId = user.tenant_id || user.tenantId;

    form.agentId = user.id;

    const res = await fetch("/api/sellers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        agentId: form.agentId,
        name: form.seller_name,
        owner_contact: form.owner_contact,
        email: form.email,
        property_type: form.property_type,
        location: form.location,
        lat: form.lat,
        lng: form.lng,
        price: form.price,
        bedrooms: form.bedrooms,
        brokerage_amount: form.brokerage_amount,

      }),
    });

    if (res.ok) router.push("/sellers");
    else alert("Failed to save property");
  }

  return (
    <div className="w-full px-6 pt-2">


      {/* ===== BUYER STYLE HEADER ===== */}
      <div className="w-full mt-4 bg-white rounded-xl overflow-hidden">

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Home className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                RealEstateCRM
              </h1>
              <p className="text-blue-100 text-sm">
                Add New Property
              </p>
            </div>
          </div>
        </div>

        {/* ===== FORM BODY ===== */}
        <div className="p-8 space-y-10">

          {/* BASIC INFO */}
          <section>
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Seller Name"
                name="seller_name"
                value={form.seller_name}
                onChange={handleChange}
                placeholder="Seller full name"
                Icon={User}
                required
              />

              {errors.seller_name && (
                <p className="text-sm text-red-500 mt-1">{errors.seller_name}</p>
              )}

              <Field
                label="Phone"
                name="owner_contact"
                value={form.owner_contact}
                onChange={handleChange}
                placeholder="Contact number"
                Icon={Phone}
                required
              />

              {errors.owner_contact && (
                <p className="text-sm text-red-500 mt-1">{errors.owner_contact}</p>
              )}

              <Field
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seller@example.com"
                Icon={Mail}
                required
              />

              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Property Type
  </label>

  <div className="relative">
    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

    <select
      name="property_type"
      value={form.property_type}
      onChange={(e) =>
        setForm({ ...form, property_type: e.target.value })
      }
      className="
        w-full pl-10 pr-4 py-3
        border border-gray-300 rounded-xl
        text-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:border-transparent transition
      "
    >
      <option value="">Select Property Type</option>
      <option value="flat">Flat / Apartment</option>
      <option value="house">Independent House</option>
      <option value="villa">Villa</option>
      <option value="plot">Plot / Land</option>
      <option value="office">Office</option>
      <option value="shop">Shop / Commercial</option>
    </select>
  </div>

  {errors.property_type && (
    <p className="text-sm text-red-500 mt-1">
      {errors.property_type}
    </p>
  )}
</div>


              {errors.property_type && (
                <p className="text-sm text-red-500 mt-1">{errors.property_type}</p>
              )}

            </div>
          </section>

          {/* PROPERTY DETAILS */}
          <section>
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              Property Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Price (₹)"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 75,00,000"
                Icon={DollarSign}
                required
              />

              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>

                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <select
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={(e) =>
                      setForm({ ...form, bedrooms: e.target.value })
                    }
                    className="
        w-full pl-10 pr-4 py-3
        border border-gray-300 rounded-xl text-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:border-transparent transition
      "
                  >
                    <option value="">Select BHK</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                </div>
              </div>

              <div>

                <Field
                  label="Brokerage Amount (₹ / %)"
                  name="brokerage_amount"
                  value={form.brokerage_amount}
                  onChange={handleChange}
                  placeholder="e.g. 2.5% or ₹50,000"
                  Icon={DollarSign}
                />


              </div>



            </div>


          </section>

          {/* LOCATION */}
          <section>
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              Location
            </h2>

            <div className="relative">
              <Field
                label="Location / Area"
                name="location"
                value={form.location}
                onChange={handleLocationChange}
                placeholder="e.g. Manjalpur, Vadodara"
                Icon={MapPin}
                required
              />

              {errors.location && (
                <p className="text-sm text-red-500 mt-1">{errors.location}</p>
              )}


              {loadingLocation && (
                <p className="text-xs text-gray-400 mt-1">Searching…</p>
              )}

              {suggestions.length > 0 && (
                <div className="absolute z-20 bg-white border rounded-lg w-full mt-1 max-h-48 overflow-auto">
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

            {form.lat && form.lng && (
              <div className="mt-6">
                <SellerLocationMap
                  lat={Number(form.lat)}
                  lng={Number(form.lng)}
                  onChange={(newLat, newLng) =>
                    setForm({
                      ...form,
                      lat: String(newLat),
                      lng: String(newLng),
                    })
                  }
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <Field
                label="Latitude"
                name="lat"
                value={form.lat}
                readOnly
                placeholder="Auto-filled from location"
              />

              <Field
                label="Longitude"
                name="lng"
                value={form.lng}
                readOnly
                placeholder="Auto-filled from location"
              />

            </div>
          </section>

          {/* ACTION */}
          <div className="flex justify-end pt-6 border-t">
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
function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  Icon,
  required = false,
  readOnly = false,
}: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}

        <input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`
            w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3
            border border-gray-300 rounded-xl text-sm
            ${readOnly ? "bg-gray-50 text-gray-600" : "bg-white"}
            focus:outline-none focus:ring-2 focus:ring-blue-500
            focus:border-transparent transition
          `}
        />
      </div>
    </div>
  );
}

/* ===== TEXTAREA ===== */
function Textarea({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="
          w-full rounded-lg border border-gray-300
          px-4 py-2.5 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
        placeholder="Example: Exclusive seller, price negotiable till 95L"
      />
    </div>
  );
}
