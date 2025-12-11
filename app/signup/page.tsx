// app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [agencyName, setAgencyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyName, name, email, password }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || `Signup failed (${res.status})`);
      }

      // success -> go to login
      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Signup failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-2">Create your <span className="text-[#c89a3b]">Agency Account</span></h2>
          <p className="text-sm text-gray-500 mb-6">Sign up to manage buyers, sellers and leads in one place.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Agency Name</label>
              <input
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                required
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                placeholder="Dream Homes Realtors"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Your Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                placeholder="Admin name"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                placeholder="********"
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#c89a3b] text-white py-2 text-sm font-medium hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600 pt-2">
              Already have an account?{" "}
              <a href="/login" className="text-[#c89a3b] hover:underline">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
