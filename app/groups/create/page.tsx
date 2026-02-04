"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import AddMemberModal from "@/components/groups/AddMemberModal";
import AccessDenied from "@/components/AccessDenied"; // ✅ IMPORT

export default function CreateGroupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // ✅ NEW
  const [checkingPermission, setCheckingPermission] = useState(true); // ✅ NEW

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  /* ===== ADD AGENCY STATES ===== */
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedAgencies, setSelectedAgencies] = useState<any[]>([]);

  /* ===== INIT USER & CHECK PERMISSION ===== */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) {
      setCheckingPermission(false);
      return;
    }

    const parsed = JSON.parse(raw);
    setUser(parsed);

    // ✅ Fetch user role from database
    fetch(`/api/users/by-id/${parsed.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("👤 User role:", data.user.role);
          setUserRole(data.user.role);
        }
      })
      .catch((err) => console.error("Error fetching user role:", err))
      .finally(() => setCheckingPermission(false));
  }, []);

  /* ===== FETCH AGENCIES ===== */
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

  // ✅ LOADING STATE
  if (checkingPermission) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // ✅ ACCESS DENIED FOR AGENTS
  if (userRole !== "ADMIN") {
    return <AccessDenied />;
  }

  // ✅ RENDER FORM (ONLY FOR ADMIN)
  return (
    <div className="w-full px-6 pt-2 space-y-6">
      <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* 🔵 BLUE HEADER */}
        <div className="bg-blue-900 px-8 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-xl font-semibold text-white">RealEstateCRM</h1>
            <p className="text-sm text-blue-100">
              Create a collaboration group for agents
            </p>
          </div>
        </div>

        {/* ⚪ FORM BODY */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8 text-sm">
          {/* SECTION: BASIC INFO */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-900"></span>
              Basic Information
            </h3>

            {/* GROUP NAME */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Vadodara Real Estate Network"
                className="w-full rounded-lg border px-4 py-2.5
                       focus:ring-1 focus:ring-blue-900 outline-none"
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the purpose of this group..."
                className="w-full rounded-lg border px-4 py-2.5 resize-none
                       focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
          </div>

          {/* SECTION: ADD AGENCY */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-900"></span>
              Members
            </h3>

            <button
              type="button"
              onClick={() => {
                fetchAvailableUsers();
                setShowAddMemberModal(true);
              }}
              className="text-blue-900 text-sm font-medium hover:underline"
            >
              + Add Agency
            </button>

            {/* SELECTED AGENCIES */}
            {selectedAgencies.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedAgencies.map((agency) => (
                  <div
                    key={agency.id}
                    className="flex justify-between items-center
                           border rounded-lg px-4 py-3 bg-gray-50"
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
                      className="text-red-500 text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push("/groups")}
              disabled={loading}
              className="px-6 py-2.5 rounded-full border text-sm
                     text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-900 text-white px-7 py-2.5
                     rounded-full text-sm font-medium
                     hover:bg-blue-900 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL */}
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