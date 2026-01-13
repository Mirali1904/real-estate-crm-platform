"use client";

import { useEffect, useState } from "react";

interface Group {
  id: number;
  name: string;
}

interface ShareToGroupModalProps {
  open: boolean;
  onClose: () => void;
  entityType: "buyer" | "seller";
  entityId: number;
}

export default function ShareToGroupModal({
  open,
  onClose,
  entityType,
  entityId,
}: ShareToGroupModalProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH GROUPS ================= */
  useEffect(() => {
    if (!open) return;

    async function fetchGroups() {
      try {
        const raw = localStorage.getItem("loggedUser");
        if (!raw) return;

        const user = JSON.parse(raw);

        const res = await fetch("/api/groups/accessible", {
          headers: {
            "x-tenant-id": String(user.tenantId),
          },
        });

        const data = await res.json();
        setGroups(data.groups || []);
      } catch (err) {
        console.error("Failed to load groups", err);
        setGroups([]);
      }
    }

    fetchGroups();
  }, [open]);

  /* ================= TOGGLE ================= */
  function toggleGroup(groupId: number) {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  }

  /* ================= SHARE ================= */
  const handleShare = async () => {
    const loggedUser = JSON.parse(
      localStorage.getItem("loggedUser") || "{}"
    );

    if (!loggedUser?.id || !loggedUser?.tenantId) return;

    setLoading(true);

    try {
      const res = await fetch("/api/groups/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  entityType,
  entityId,
  groupIds: selectedGroups,
  userId: loggedUser.id,
  tenantId: loggedUser.tenantId,

  // ✅ ADD THIS ONLY FOR SELLER
  sellerId: entityType === "seller" ? entityId : null,
}),

      });

      if (!res.ok) return;

      setSelectedGroups([]);
      onClose();
    } catch (err) {
      console.error("Share error", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Share to Groups
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* GROUP LIST */}
        <div className="px-6 py-4 max-h-72 overflow-y-auto space-y-3">
          {groups.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No groups available
            </p>
          )}

          {groups.map((group) => (
            <label
              key={group.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition
                ${
                  selectedGroups.includes(group.id)
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:bg-gray-50"
                }
              `}
            >
              <input
                type="checkbox"
                checked={selectedGroups.includes(group.id)}
                onChange={() => toggleGroup(group.id)}
                className="accent-indigo-600"
              />
              <span className="text-sm font-medium text-gray-800">
                {group.name}
              </span>
            </label>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="px-6 py-4 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border rounded-full hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
  onClick={handleShare}
  disabled={loading || selectedGroups.length === 0}
  className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition disabled:opacity-60"
>
  {loading ? "Sharing..." : "Share"}
</button>

        </div>
      </div>
    </div>
  );
}
