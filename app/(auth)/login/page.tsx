"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(
        "loggedUser",
        JSON.stringify({
          id: data.user.id,
          tenantId: data.user.tenantId,
          name: data.user.name,
          email: data.user.email,
        })
      );
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }

    setLoading(false);
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-3 sm:px-4 bg-gray-50">





      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-52 h-52 md:w-72 md:h-72 bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="absolute bottom-10 right-10 w-52 h-52 md:w-72 md:h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>



      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md sm:max-w-md md:max-w-lg">



        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.35)] p-6 sm:p-8 md:p-10 space-y-7 w-full">



          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-xl bg-blue-900 flex items-center justify-center">



                <Building2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              RealEstate CRM</h1>
            <p className="text-slate-500 text-sm">Welcome back to your agency portal</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center py-2 px-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
 px-4 rounded-lg
  border border-gray-300
  focus:border-blue-900
  focus:ring-2 focus:ring-blue-400
  outline-none
"


              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>

              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="
  w-full h-11 sm:h-12
px-4 rounded-lg
  border border-gray-300
  focus:border-blue-900
  focus:ring-2 focus:ring-blue-400
  outline-none
"


                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12
 bg-blue-900 hover:bg-blue-900 text-white rounded-lg transition">



              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>



          {/* Footer */}
          <div className="pt-6 text-center text-sm text-gray-500">

            Don't have an account?
            <span
              onClick={() => router.push("/signup")}
              className="
      ml-1 cursor-pointer font-medium
      text-blue-900
      hover:text-blue-700
      transition-colors
    "
            >
              Sign up
            </span>
          </div>


        </div>

      </div>
    </div>
  );
}