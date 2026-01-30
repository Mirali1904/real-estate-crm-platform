"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Building2 } from "lucide-react";
import Link from "next/link";


export default function SignupPage() {
  const router = useRouter();

  const [agencyName, setAgencyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
  agencyName?: string;
  name?: string;
  email?: string;
  password?: string;
}>({});

function validateForm() {
  const newErrors: typeof errors = {};

  if (!agencyName.trim()) {
    newErrors.agencyName = "Agency name is required";
  } else if (agencyName.length < 3) {
    newErrors.agencyName = "Agency name must be at least 3 characters";
  }

  if (!name.trim()) {
    newErrors.name = "Your name is required";
  } else if (name.length < 2) {
    newErrors.name = "Name must be at least 2 characters";
  }

  if (!email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    newErrors.email = "Invalid email address";
  }

  const password = passwordRef.current?.value || "";
  if (!password) {
    newErrors.password = "Password is required";
  } else if (password.length < 8) {
    newErrors.password = "Password must be at least 8 characters";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}


  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");

  if (!validateForm()) return; //  STOP if invalid

  setLoading(true);

  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tenantName: agencyName,
      name,
      email,
      password: passwordRef.current?.value || "",
    }),
  });

  if (res.ok) {
    router.push("/login");
  } else {
    const data = await res.json().catch(() => null);
    setError(data?.message || "Signup failed");
  }

  setLoading(false);
}


  return (
   <div className="min-h-screen w-full flex items-center justify-center px-3 sm:px-4 md:px-6 bg-gray-50">





      {/* Signup Card */}
     <div className="relative w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">

        <div className="bg-white/95 backdrop-blur rounded-2xl
shadow-[0_30px_80px_rgba(0,0,0,0.35)]
p-5 sm:p-6 md:p-8 lg:p-10
 space-y-7 w-full">



          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-blue-900
rounded-xl flex items-center justify-center shadow-lg">



                <Building2 className="w-7 h-7 text-white" />
              </div>
            </div>
           <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">

              RealEstate CRM
            </h1>
            <p className="text-slate-500 text-sm">
              Create your agency account
            </p>

          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center py-2 px-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Agency Name */}
            <div className="space-y-2">
              <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700">
                Agency Name
              </label>
              <input
                id="agencyName"
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Dream Homes Realtors"
                className="
w-full h-11 sm:h-12
 px-4
bg-gray-50
border border-gray-200
text-gray-900 placeholder:text-gray-400
rounded-lg
focus:border-blue-500
focus:ring-2 focus:ring-blue-500/30

outline-none
"



                required
              />
   {errors.name && (
  <p className="text-sm text-red-500">{errors.name}</p>
)}

            </div>

            {/* Your Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin name"
                className="
w-full h-11 sm:h-12
 px-4
bg-gray-50
border border-gray-200
text-gray-900 placeholder:text-gray-400
rounded-lg
focus:border-blue-500
focus:ring-2 focus:ring-blue-500/30

outline-none
"


                required
              />
              {errors.agencyName && (
  <p className="text-sm text-red-500">{errors.agencyName}</p>
)}

            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="
w-full h-11 sm:h-12
 px-4
bg-gray-50
border border-gray-200
text-gray-900 placeholder:text-gray-400
rounded-lg
focus:border-blue-400
focus:ring-2 focus:ring-blue-400/30

outline-none
"


                required
              />
              {errors.email && (
  <p className="text-sm text-red-500">{errors.email}</p>
)}

            </div>

            {/* Password */}
          <div className="space-y-2">
  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
    Password
  </label>

  <div className="relative">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      ref={passwordRef}
      placeholder="••••••••"
      autoComplete="new-password"
      className="
        w-full h-11 sm:h-12 px-4
        bg-gray-50
        border border-gray-200
        rounded-lg
        focus:border-blue-500
        focus:ring-2 focus:ring-blue-500/30
        outline-none
      "
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>

  {errors.password && (
    <p className="text-sm text-red-500">{errors.password}</p>
  )}
</div>




            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="
    w-full h-11 sm:h-12

    bg-blue-900 hover:bg-blue-900
    text-white font-semibold
    rounded-lg
    transition-colors
    disabled:opacity-60 disabled:cursor-not-allowed
  "
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>


          {/* Footer */}
          <div className="pt-6 text-center text-sm text-gray-500">
            Already have an account?
            <span
              onClick={() => router.push("/login")}
              className="
      ml-1 cursor-pointer font-medium
      text-blue-900
      hover:text-blue-700
      transition-colors
    "
            >
              Login
            </span>
          </div>








        </div>
      </div>
    </div>
  );
}
