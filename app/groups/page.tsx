"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Users, MessageCircle, MoreHorizontal, Lock, Globe } from "lucide-react";

interface Group {
  id: number;
  name: string;
  description: string;
  creator_name: string;
  member_count: number;
  user_role?: string;
  created_at: string;
  post_count?: number;
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}



function GroupCard({ group, onClick }: { group: Group; onClick: () => void }) {
  const isPrivate = true; // You can adjust based on your data

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer p-6 border border-gray-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {group.name}
            </h3>
          </div>
          <p className="text-sm text-gray-600 min-h-[40px]">
            {group.description || "No description provided"}
          </p>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg">
          <MoreHorizontal className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Privacy & Admin */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${isPrivate
            ? "bg-orange-100 text-orange-800"
            : "bg-blue-100 text-blue-800"
          }`}>
          {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
          {isPrivate ? "Private" : "Public"}
        </span>
        <span className="text-xs text-gray-500">
          Admin: {group.creator_name}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Members</p>
          <p className="text-xl font-bold text-gray-900">{group.member_count}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Posts</p>
          <p className="text-xl font-bold text-gray-900">
            {group.post_count ?? 0}
          </p>

        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Active</p>
          <p className="text-sm font-bold text-teal-600 truncate">
            {timeAgo(group.created_at)}
          </p>

        </div>
      </div>

      {/* Action Button */}
      <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
        <MessageCircle className="w-4 h-4" />
        View Group
      </button>
    </div>
  );
}

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(raw);
    setUser(parsed);

    fetch(`/api/groups?tenantId=${parsed.tenantId}&userId=${parsed.id}`)
      .then((res) => res.json())
      .then((data) => {
        setGroups(Array.isArray(data) ? data : data.groups || []);
      })
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredGroups = groups.filter((group) => {
    const q = search.toLowerCase();
    return (
      group.name.toLowerCase().includes(q) ||
      (group.description ?? "").toLowerCase().includes(q) ||
      group.creator_name.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-6 space-y-6">



        {/* Search + Create Group Row */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">



          {/* Search Bar - Full Width */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                 focus:ring-2 focus:ring-blue-300 focus:border-blue-400
                 outline-none bg-white"
            />
          </div>

          {/* Create Group Button */}
          {user && user.role !== "AGENT" && (
            <button
              onClick={() => router.push("/groups/create")}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg
                 text-sm font-medium hover:bg-blue-700 transition
                 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          )}
        </div>


        {/* Content */}
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Create Your First Group
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Groups help your team collaborate and share information efficiently
            </p>
            {user && user.role !== "AGENT" && (
              <button
                onClick={() => router.push("/groups/create")}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => router.push(`/groups/${group.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}