"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Users, MessageCircle, MoreHorizontal, Lock, Globe, TrendingUp } from "lucide-react";

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
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${diffMonths}mo ago`;
}

function GroupCard({ group, onClick }: { group: Group; onClick: () => void }) {
  const isPrivate = true;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 group relative"
    >
      {/* Gradient Header Bar */}
      <div className="h-2 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900"></div>
      
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            
            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors mb-1.5 truncate">
                {group.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {group.description || "No description provided"}
              </p>
            </div>
          </div>
          
          <button 
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg ml-2"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Privacy & Admin Info */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
            isPrivate
              ? "bg-orange-50 text-orange-700 border border-orange-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}>
            {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
            {isPrivate ? "Private" : "Public"}
          </span>
          <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-700">Admin:</span> {group.creator_name}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3.5 border border-blue-200/50">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-blue-900 mr-1" />
              <p className="text-xs font-medium text-blue-900">Members</p>
            </div>
            <p className="text-2xl font-bold text-blue-900 text-center">{group.member_count}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-3.5 border border-purple-200/50">
            <div className="flex items-center justify-center mb-1">
              <MessageCircle className="w-4 h-4 text-purple-900 mr-1" />
              <p className="text-xs font-medium text-purple-900">Posts</p>
            </div>
            <p className="text-2xl font-bold text-purple-900 text-center">{group.post_count ?? 0}</p>
          </div>
          
          <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-3.5 border border-teal-200/50">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-teal-900 mr-1" />
              <p className="text-xs font-medium text-teal-900">Active</p>
            </div>
            <p className="text-sm font-bold text-teal-900 text-center">{timeAgo(group.created_at)}</p>
          </div>
        </div>

        {/* Action Button */}
        <button 
          className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-3 rounded-xl text-sm font-semibold hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 flex items-center justify-center gap-2"
          onClick={onClick}
        >
          <MessageCircle className="w-4 h-4" />
          View Group
        </button>
      </div>
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
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="w-full px-6 space-y-6">
        {/* Search + Create Group Row */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mt-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups by name, description, or admin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm
                 focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900
                 outline-none bg-white shadow-sm hover:border-gray-300 transition-colors
                 placeholder:text-gray-400"
            />
          </div>

          {/* Create Group Button */}
          {user && user.role !== "AGENT" && (
            <button
              onClick={() => router.push("/groups/create")}
              className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-3.5 rounded-xl
                 text-sm font-semibold hover:from-blue-800 hover:to-blue-700 transition-all
                 flex items-center gap-2 whitespace-nowrap shadow-lg shadow-blue-900/20
                 hover:shadow-xl hover:shadow-blue-900/30"
            >
              <Plus className="w-5 h-5" />
              Create Group
            </button>
          )}
        </div>

        {/* Content */}
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {search ? "No Groups Found" : "Create Your First Group"}
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              {search 
                ? "Try adjusting your search terms or create a new group"
                : "Groups help your team collaborate and share information efficiently"}
            </p>
            {user && user.role !== "AGENT" && (
              <button
                onClick={() => router.push("/groups/create")}
                className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-800 hover:to-blue-700 transition-all inline-flex items-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <Plus className="w-5 h-5" />
                Create Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
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