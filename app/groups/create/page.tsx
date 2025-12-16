"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    // Get user from localStorage
    const raw = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      setUser(parsed);
    } else {
      // Fallback
      setUser({ id: 1, tenantId: 1 });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter group name");
      return;
    }

    if (!user) {
      alert("User not found");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: user.tenantId,
          name: formData.name,
          description: formData.description,
          createdBy: user.id,
        }),
      });

      if (response.ok) {
        router.push("/groups");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <button
            onClick={() => router.push("/groups")}
            className="text-[#c99a2e] hover:text-[#b08926] mb-4 flex items-center gap-1 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Groups
          </button>
          <h1 className="text-2xl font-semibold">Create New Group</h1>
          <p className="text-gray-600 mt-1">
            Create a collaboration group for agents
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c99a2e]"
              placeholder="e.g., Vadodara Real Estate Network"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c99a2e]"
              placeholder="Describe the purpose of this group..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/groups")}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#c99a2e] hover:bg-[#b08926] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}