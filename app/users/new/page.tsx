"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";

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

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) {
      router.replace("/login");
      return;
    }

    try {
      setCurrentUser(JSON.parse(raw));
    } catch {
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
        router.push("/users");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="w-full px-6 pt-2 space-y-6">
      <BackButton />

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-lg font-semibold mb-1">
          Add <span className="text-indigo-600">User</span>
        </h1>

        <p className="text-xs text-gray-500 mb-6">
          User will be added to your agency (tenant_id{" "}
          {currentUser.tenantId ?? currentUser.tenant_id})
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              placeholder="Agent name"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              placeholder="agent@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="
                  w-full rounded-xl border px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                "
              >
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {/* 🔥 BUTTON — SAME AS ADD BUYER */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="
                bg-indigo-600
                text-white
                px-6
                py-2.5
                rounded-full
                text-sm
                font-medium
                hover:bg-indigo-700
                transition
                disabled:opacity-60
              "
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>

          {message && (
            <p className="text-center text-xs text-gray-500">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: any) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full rounded-xl border px-4 py-3 text-sm
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      />
    </div>
  );
}
