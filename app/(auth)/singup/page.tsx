// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [agencyName, setAgencyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agencyName, name, email, password }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      alert("Signup failed");
    }
  }

  return (
    <div className="bg-white shadow rounded p-6">
      <h1 className="text-2xl font-semibold mb-4">Create your Agency Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Agency name" className="w-full border rounded px-3 py-2" />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full border rounded px-3 py-2" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border rounded px-3 py-2" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" className="w-full border rounded px-3 py-2" />
        <button type="submit" className="w-full rounded py-2 bg-yellow-700 text-white">Sign Up</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <a href="/login" className="text-blue-600 underline">Login</a></p>
    </div>
  );
}
