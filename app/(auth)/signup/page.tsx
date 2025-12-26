"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [agencyName, setAgencyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="bg-white rounded-xl shadow-md w-full max-w-2xl p-16">

        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-center mb-2">
          Create your Agency Account
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Sign up to manage buyers, sellers and leads in one place
        </p>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* AGENCY NAME */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Agency Name
            </label>
            <input
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Dream Homes Realtors"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#c99a2e]"
              required
            />
          </div>

          {/* YOUR NAME */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Your Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin name"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#c99a2e]"
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#c99a2e]"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              ref={passwordRef}
              placeholder="********"
              autoComplete="new-password"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#c99a2e]"
              required
            />
          </div>

          {/* SIGNUP BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c99a2e] text-white py-2 rounded-md font-medium hover:opacity-90 transition"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* LOGIN LINK */}
        <p className="mt-4 text-sm text-center text-gray-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#c99a2e] font-medium hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
