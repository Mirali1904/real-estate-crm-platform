"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, Home, MapPin, DollarSign } from "lucide-react";

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

    agentId: null,
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const debouncedLocation = useDebounce(form.location, 600);
  const lastSearchedRef = useRef<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});


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
  function validateForm() {
    const newErrors: Record<string, string> = {};

    // Name
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Phone (India example)
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = "Enter valid 10 digit phone number";
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }

    // Requirement
    if (!form.requirement.trim()) {
      newErrors.requirement = "Requirement is required";
    }

    // Budget
    if (form.budget_min && isNaN(Number(form.budget_min))) {
      newErrors.budget_min = "Budget min must be a number";
    }

    if (form.budget_max && isNaN(Number(form.budget_max))) {
      newErrors.budget_max = "Budget max must be a number";
    }

    if (
      form.budget_min &&
      form.budget_max &&
      Number(form.budget_min) > Number(form.budget_max)
    ) {
      newErrors.budget_max = "Max budget must be greater than min budget";
    }

    // Bedrooms
    if (form.bedrooms && isNaN(Number(form.bedrooms))) {
      newErrors.bedrooms = "Bedrooms must be a number";
    }

    // Location check
    if (form.location && (!form.lat || !form.lng)) {
      newErrors.location = "Please select a location from suggestions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }


  async function handleSubmit() {

    if (!validateForm()) return; //  STOP if invalid

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
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-6 py-6">




        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Blue Header Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">RealEstateCRM</h1>
                <p className="text-blue-100 text-sm">Add New Buyer Lead</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="space-y-8">
              {/* Section 1: Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Buyer's full name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                      )}

                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Contact number"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                      )}

                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="buyer@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                      )}

                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requirement <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="requirement"
                        value={form.requirement}
                        onChange={handleChange}
                        placeholder="e.g., 2BHK Flat"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                      />
                      {errors.requirement && (
                        <p className="text-sm text-red-500 mt-1">{errors.requirement}</p>
                      )}

                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Budget & Preferences */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Budget & Preferences
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Min (₹)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="budget_min"
                        value={form.budget_min}
                        onChange={handleChange}
                        placeholder="e.g., 50,00,000"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      {errors.budget_min && (
                        <p className="text-sm text-red-500 mt-1">{errors.budget_min}</p>
                      )}

                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Max (₹)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="budget_max"
                        value={form.budget_max}
                        onChange={handleChange}
                        placeholder="e.g., 75,00,000"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      {errors.budget_max && (
                        <p className="text-sm text-red-500 mt-1">{errors.budget_max}</p>
                      )}

                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="bedrooms"
                        value={form.bedrooms}
                        onChange={handleChange}
                        placeholder="e.g., 2"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      {errors.bedrooms && (
                        <p className="text-sm text-red-500 mt-1">{errors.bedrooms}</p>
                      )}

                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Radius (km)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="radius_km"
                        value={form.radius_km}
                        onChange={handleChange}
                        placeholder="e.g., 5"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      {errors.radius_km && (
                        <p className="text-sm text-red-500 mt-1">{errors.radius_km}</p>
                      )}

                    </div>
                  </div>

                  <div className="md:col-span-2 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location/Area
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        value={form.location}
                        onChange={handleLocationChange}
                        placeholder="e.g., Vastrapur, Ahmedabad"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500 mt-1">{errors.location}</p>
                      )}

                    </div>
                    {loadingLocation && (
                      <p className="text-xs text-gray-500 mt-2">Searching locations...</p>
                    )}
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 bg-white border border-gray-300 w-full rounded-xl mt-2 max-h-48 overflow-auto shadow-lg">
                        {suggestions.map((place, i) => (
                          <div
                            key={i}
                            onClick={() => selectLocation(place)}
                            className="px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer transition border-b border-gray-100 last:border-0"
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
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Location Coordinates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      value={form.lat}
                      readOnly
                      placeholder="Auto-filled from location"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      value={form.lng}
                      readOnly
                      placeholder="Auto-filled from location"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Brokerage & Additional Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Brokerage & Additional Info
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brokerage Amount (₹ / %)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="brokerage_amount"
                        value={form.brokerage_amount}
                        onChange={handleChange}
                        placeholder="e.g., 2.5% or ₹50,000"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      {errors.brokerage_amount && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.brokerage_amount}
                        </p>
                      )}

                    </div>
                  </div>


                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push("/buyers")}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Add Buyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}