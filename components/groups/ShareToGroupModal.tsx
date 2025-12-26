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

        console.log("fetching groups for", {
          userId: user.id,
          tenantId: user.tenantId,
        });

        const res = await fetch("/api/groups/accessible", {
          headers: {
            "x-tenant-id": String(user.tenantId),
          },
        });

        const data = await res.json();
        console.log("groups response:", data);

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

    if (!loggedUser?.id || !loggedUser?.tenantId) {
      console.error("❌ loggedUser missing fields", loggedUser);
      return;
    }

    setLoading(true);

    console.log("📦 SHARE PAYLOAD", {
      entityType,
      entityId,
      groupIds: selectedGroups,
      userId: loggedUser.id,
      tenantId: loggedUser.tenantId,
    });

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
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("❌ Share failed", err);
        return;
      }

      console.log("✅ Share success");
      setSelectedGroups([]);
      onClose();
    } catch (err) {
      console.error("❌ Share error", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Share to Groups</h2>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {groups.length === 0 && (
            <p className="text-sm text-gray-500">No groups available</p>
          )}

          {groups.map((group) => (
            <label
              key={group.id}
              className="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedGroups.includes(group.id)}
                onChange={() => toggleGroup(group.id)}
              />
              <span className="text-sm font-medium">{group.name}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleShare}
            disabled={loading || selectedGroups.length === 0}
            className="px-4 py-2 text-sm bg-[#c89a3b] text-white rounded-lg disabled:opacity-60"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
