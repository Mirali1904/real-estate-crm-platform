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
    <div
      className="
        min-h-screen
        w-full
        flex items-center justify-center
        px-4
        bg-indigo-50
      "
    >
      {/* CARD */}
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
          Create your account
        </h2>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Start managing buyers, sellers and deals
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <Field
            label="Agency Name"
            value={agencyName}
            onChange={setAgencyName}
            placeholder="Dream Homes Realtors"
          />

          <Field
            label="Your Name"
            value={name}
            onChange={setName}
            placeholder="Admin name"
          />

          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>
            <input
              type="password"
              ref={passwordRef}
              placeholder="••••••••"
              autoComplete="new-password"
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

          {/* SUBMIT BUTTON */}
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* LOGIN LINK */}
        <p className="mt-6 text-sm text-center text-gray-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

/* ---------- FIELD COMPONENT ---------- */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
  );
}
