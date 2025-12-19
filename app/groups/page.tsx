"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";

interface Group {
  id: number;
  name: string;
  description: string;
  creator_name: string;
  member_count: number;
  user_role?: string;
  created_at: string;
}

/* -------------------------
   Group Card
-------------------------- */
function GroupCard({
  group,
  onClick,
}: {
  group: Group;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6 border border-gray-200"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {group.name}
        </h3>

        {group.user_role === "ADMIN" && (
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
            Admin
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
        {group.description || "No description provided"}
      </p>

      <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center gap-1">
          <span>{group.member_count} members</span>
        </div>
        <div>by {group.creator_name}</div>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("loggedUser")
        : null;

    if (raw) {
      const parsed = JSON.parse(raw);
      setUser(parsed);
      fetchGroups(parsed.tenantId, parsed.id);
    }
  }, []);

  const fetchGroups = async (tenantId: number, userId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/groups?tenantId=${tenantId}&userId=${userId}`
      );
      const data = await response.json();
      setGroups(Array.isArray(data) ? data : data.groups || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="w-full p-6">
      {/* BACK */}
      <div className="mb-4">
        <BackButton />
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Groups</h1>
          <p className="text-gray-600 mt-1">
            Collaborate with other agents in your network
          </p>
        </div>

        {user && user.role !== "AGENT" && (
          <button
            onClick={() => router.push("/groups/create")}
            className="bg-[#c99a2e] text-white px-4 py-2 rounded-full"
          >
            + Create Group
          </button>
        )}
      </div>

      {/* CONTENT */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500 mb-4">
            No groups yet
          </p>
          <button
            onClick={() => router.push("/groups/create")}
            className="bg-[#c99a2e] text-white px-4 py-2 rounded-full"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => router.push(`/groups/${group.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
