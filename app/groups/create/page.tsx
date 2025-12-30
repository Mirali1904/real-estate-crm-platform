"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import AddMemberModal from "@/components/groups/AddMemberModal";

export default function CreateGroupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  /* ===== ADD AGENCY STATES ===== */
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<any[]>([]); // ✅ NEW

  /* ===== INIT USER ===== */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (raw) {
      setUser(JSON.parse(raw));
    }
  }, []);

  /* ===== FETCH AGENCIES (SAME AS GROUP PAGE) ===== */
  const fetchAvailableUsers = async () => {
    if (!user) return;

    try {
      const res = await fetch(
        `/api/groups/available-agencies?currentUserId=${user.id}`
      );

      const data = await res.json();
      setAvailableUsers(data || []);
    } catch (error) {
      console.error("Fetch agencies error:", error);
      setAvailableUsers([]);
    }
  };

  /* ===== CREATE GROUP ===== */
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

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to create group");
        return;
      }

      const result = await response.json();
      const groupId = result.groupId;

      /* ===== ATTACH SELECTED AGENCIES ===== */
      if (selectedUsers.length > 0) {
        await Promise.all(
          selectedUsers.map((tenantId) =>
            fetch("/api/groups/agencies", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                groupId,
                tenantId,
              }),
            })
          )
        );
      }

      router.push("/groups");
    } catch (error) {
      console.error("Create group error:", error);
      alert("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-6 pt-2 space-y-6">
      <BackButton />

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
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
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
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* ADD AGENCY */}
          <button
            type="button"
            onClick={() => {
              fetchAvailableUsers();
              setShowAddMemberModal(true);
            }}
            className="text-sm text-indigo-600 hover:underline"
          >
            + Add Agency
          </button>

          {/* ✅ SELECTED AGENCIES PREVIEW */}
          {selectedAgencies.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Selected Agencies</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedAgencies.map((agency) => (
                  <div
                    key={agency.id}
                    className="flex justify-between items-center border rounded-lg px-3 py-2 bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium">{agency.name}</p>
                      <p className="text-xs text-gray-500">{agency.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUsers((prev) =>
                          prev.filter((id) => id !== agency.id)
                        );
                        setSelectedAgencies((prev) =>
                          prev.filter((a) => a.id !== agency.id)
                        );
                      }}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/groups")}
              disabled={loading}
              className="px-5 py-2.5 rounded-full border text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>

      {/* ADD MEMBER MODAL */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        agents={availableUsers}
        onAddMember={(tenantId) => {
          const agency = availableUsers.find((a) => a.id === tenantId);
          if (!agency) return;

          setSelectedUsers((prev) =>
            prev.includes(tenantId) ? prev : [...prev, tenantId]
          );

          setSelectedAgencies((prev) =>
            prev.find((a) => a.id === tenantId) ? prev : [...prev, agency]
          );

          setShowAddMemberModal(false);
        }}
      />
    </div>
  );
}
