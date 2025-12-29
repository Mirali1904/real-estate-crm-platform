"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (raw) {
      setUser(JSON.parse(raw));
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
    <div className="w-full px-6 pt-2 space-y-6">
      {/* BACK */}
      <BackButton />

      {/* FORM CARD — SAME THEME AS BUYER / USER */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-xl font-semibold mb-1">
          Create <span className="text-indigo-600">Group</span>
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Create a collaboration group for agents
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {/* GROUP NAME */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Vadodara Real Estate Network"
              className="
                w-full
                border
                rounded-lg
                px-3
                py-2
                focus:ring-2
                focus:ring-indigo-500
                outline-none
              "
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Describe the purpose of this group…"
              className="
                w-full
                border
                rounded-lg
                px-3
                py-2
                focus:ring-2
                focus:ring-indigo-500
                outline-none
                resize-none
              "
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/groups")}
              disabled={loading}
              className="
                px-5
                py-2.5
                rounded-full
                border
                text-sm
                text-gray-600
                hover:bg-gray-50
                transition
              "
            >
              Cancel
            </button>

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
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
