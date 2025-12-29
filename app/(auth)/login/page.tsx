"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          agencyId: data.user.agencyId,
        })
      );
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }

    setLoading(false);
  }

  return (
    <div
      className="
        min-h-screen
        w-full
        flex items-center justify-center
        px-4
        bg-indigo-50
      "
    >
      {/* LOGIN CARD */}
      <div
        className="
          w-full
          max-w-md
          bg-white
          rounded-2xl
          shadow-lg
          p-8
        "
      >
        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Login to your agency account
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="
                w-full
                border border-gray-300
                rounded-lg
                px-4 py-2.5
                text-sm
                bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="
                w-full
                border border-gray-300
                rounded-lg
                px-4 py-2.5
                text-sm
                bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-indigo-500
              "
              required
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-indigo-600
              text-white
              py-2.5
              rounded-lg
              font-medium
              hover:bg-indigo-700
              transition
              disabled:opacity-60
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* SIGNUP LINK */}
        <p className="mt-6 text-sm text-center text-gray-500">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
