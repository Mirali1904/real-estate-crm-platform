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
   <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-indigo-100 to-blue-100 flex items-center justify-center px-4">



      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
<div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-8 md:p-10 space-y-7 w-full">

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">

                <Building2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">RealEstate CRM</h1>
            <p className="text-gray-600 text-sm">Welcome back to your agency portal</p>
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
                className="w-full h-11 px-4 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg outline-none focus:outline-none focus:border-indigo-600 focus:ring-0 focus:shadow-none"

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
                 className="w-full h-11 px-4 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-lg outline-none focus:outline-none focus:border-indigo-600 focus:ring-0 focus:shadow-none"
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
  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
>

              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          

          {/* Footer */}
          <div className="pt-4 text-center text-sm text-gray-500">
  Don't have an account?
  <span
    onClick={() => router.push("/signup")}
    className="ml-1 cursor-pointer text-gray-700 font-medium hover:text-indigo-600 transition-colors"
  >
    Sign up
  </span>
</div>

</div>
        
      </div>
    </div>
  );
}