"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Group {
  id: number;
  name: string;
  description: string;
  creator_name: string;
  member_count: number;
  user_role?: string;
  created_at: string;
}

// GroupCard component inline
function GroupCard({ group, onClick }: { 
  group: Group; 
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6 border border-gray-200"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {group.name}
        </h3>
        {group.user_role === "ADMIN" && (
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
            Admin
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[40px]">
        {group.description || "No description provided"}
      </p>

      <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center gap-1">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
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
    // Get user from localStorage (like sellers page)
    const raw = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      setUser(parsed);
      fetchGroups(parsed.tenantId, parsed.id);
    } else {
      // Fallback to hardcoded (like buyers page)
      const fallbackUser = { id: 1, tenantId: 1 };
      setUser(fallbackUser);
      fetchGroups(fallbackUser.tenantId, fallbackUser.id);
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

  const handleGroupClick = (groupId: number) => {
    router.push(`/groups/${groupId}`);
  };

  const handleCreateClick = () => {
    router.push("/groups/create");
  };

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Groups</h1>
          <p className="text-gray-600 mt-1">
            Collaborate with other agents in your network
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="bg-[#c99a2e] text-white px-4 py-2 rounded-full"
        >
          + Create Group
        </button>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-lg mb-2">No groups yet</div>
          <p className="text-gray-500 mb-6">
            Create your first group to start collaborating with agents
          </p>
          <button
            onClick={handleCreateClick}
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
              onClick={() => handleGroupClick(group.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}