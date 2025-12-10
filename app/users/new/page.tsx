"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LoggedUser = {
  id: number;
  tenantId?: number;
  tenant_id?: number;
  name: string;
  email: string;
  role: string;
};

export default function NewUserPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("AGENT");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // get logged in user info (so we know tenantId)
  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("loggedUser")
        : null;

    if (!raw) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as LoggedUser;
      setCurrentUser(parsed);
    } catch (err) {
      console.error(err);
      router.replace("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const tenantId = currentUser.tenantId ?? currentUser.tenant_id;
    if (!tenantId) {
      setMessage("No tenant found. Please login again.");
      return;
    }

    if (!name || !email || !password) {
      setMessage("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to create user");
      } else {
        setMessage("User created successfully!");
        setName("");
        setEmail("");
        setPassword("");
        setRole("AGENT");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#f5f5f5]">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-md border border-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-2">
          Add <span className="text-[#c89a3b]">User / Agent</span>
        </h1>
        <p className="text-xs text-gray-500 mb-6">
          New user will be created inside your agency (tenant_id{" "}
          {currentUser.tenantId ?? currentUser.tenant_id}).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block mb-1 text-gray-600">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Agent name"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@example.com"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Role</label>
            <select
              className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-[#c89a3b]"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="AGENT">Agent</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c89a3b] text-white py-2.5 rounded-full text-sm font-medium hover:bg-[#b4882f] transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-xs text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
