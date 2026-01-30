"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, Users, FileText, MessageSquare, Plus, Trash2, ArrowLeft, Calendar, MapPin, DollarSign, Eye, TrendingUp, Clock } from "lucide-react";

import AddMemberModal from "@/components/groups/AddMemberModal";
import AgencyCard from "@/components/groups/AgencyCard";
import CreatePostModal from "@/components/groups/CreatePostModal";
import PostCard from "@/components/groups/PostCard";
import PostResponsesModal from "@/components/groups/PostResponsesModal";
import GroupChat from "@/components/groups/GroupChat";

/* ================= TYPES ================= */
interface Group {
  id: number;
  name: string;
  description: string;
  creator_name: string;
  created_by: number;
  created_at: string;
}

interface Post {
  id: number;
  post_type: string;
  title: string;
  description: string;
  location?: string;
  budget?: number;
  user_id: number;
  tenant_id: number;
  author_name: string;
  author_email: string;
  response_count: number;
  created_at: string;
}

interface Member {
  id: number;
  tenant_id: number;
  name: string;
  email: string;
}

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  if (!params?.id) {
    return <div className="p-6">Invalid group</div>;
  }

  const groupId = Number(params.id);

  const [user, setUser] = useState<any>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "members" | "chat">("posts");

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [activePostId, setActivePostId] = useState<number | null>(null);

  const [messageCount, setMessageCount] = useState(0);

  /* ================= SAFE FETCH ================= */
  const safeFetch = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  };

  /* ================= INIT ================= */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const u = JSON.parse(raw);
    setUser(u);

    fetchAll(u.id, u.tenantId);
  }, [groupId]);

  /* ================= FETCH ALL ================= */
  const fetchAll = async (userId: number, tenantId?: number) => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const g = await safeFetch(`/api/groups/${groupId}`);
    if (!g) {
      setLoading(false);
      return;
    }

    setGroup(g);
    setIsAdmin(g.created_by === userId);

    const p = await safeFetch(`/api/groups/posts?groupId=${groupId}`);
    setPosts(Array.isArray(p) ? p : Object.values(p || {}));

    const m = await safeFetch(`/api/groups/agencies?groupId=${groupId}`);
    setMembers(m || []);

    const msgs = await safeFetch(
      `/api/groups/messages?groupId=${groupId}&tenantId=${tenantId}`
    );
    setMessageCount((msgs?.messages || []).length);

    setLoading(false);
  };

  /* ================= AVAILABLE AGENCIES ================= */
  const fetchAvailableUsers = async () => {
    if (!user) return;
    const data = await safeFetch(
      `/api/groups/available-agencies?groupId=${groupId}&currentUserId=${user.id}`
    );
    setAvailableUsers(data || []);
  };

  /* ================= ACTIONS ================= */
  const handleDeleteGroup = async () => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    const res = await fetch(
      `/api/groups?groupId=${groupId}&tenantId=${user.tenantId}&userId=${user.id}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      alert("You are not allowed to delete this group");
      return;
    }

    router.push("/groups");
  };

  const handleAddUser = async (tenantId: number) => {
    await fetch("/api/groups/agencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, tenantId }),
    });

    await fetchAll(user.id);
    await fetchAvailableUsers();
    setShowAddMemberModal(false);
  };

  const handleRemoveUser = async (tenantId: number) => {
    await fetch(
      `/api/groups/agencies?groupId=${groupId}&tenantId=${tenantId}`,
      { method: "DELETE" }
    );
    fetchAll(user.id);
  };

  const handleCreatePost = async (data: any) => {
    await fetch("/api/groups/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        userId: user.id,
        tenantId: user.tenantId,
        ...data,
      }),
    });

    setShowCreatePostModal(false);
    fetchAll(user.id);
  };

  const handleDeletePost = async (postId: number) => {
    await fetch("/api/groups/posts/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });

    fetchAll(user.id);
  };

  /* ================= HELPERS ================= */
 const getTimeAgo = (dateString?: string) => {
  if (!dateString) return "just now";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "just now";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  return `${diffMonths}mo ago`;
};


  const formatBudget = (budget?: number) => {
    if (!budget) return "Not specified";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(budget);
  };

  /* ================= PROFESSIONAL POST CARD ================= */
  const ProfessionalPostCard = ({ post }: { post: Post }) => {
    const typeBadgeColors = {
      BUYER: "bg-emerald-50 text-emerald-700 border-emerald-200",
      SELLER: "bg-blue-50 text-blue-900 border-blue-200",
      GENERAL: "bg-purple-50 text-purple-700 border-purple-200",
    };

    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 group">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase border ${typeBadgeColors[post.post_type as keyof typeof typeBadgeColors] || typeBadgeColors.GENERAL}`}>
                  {post.post_type}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {getTimeAgo(post.created_at)}
                </span>
              </div>
              
              <h3 className="text-base font-semibold text-gray-900 mb-1.5 group-hover:text-blue-900 transition-colors">
                {post.title}
              </h3>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {post.description}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {post.location && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-blue-900" />
                    <span>{post.location}</span>
                  </div>
                )}
                {post.budget && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium text-emerald-700">{formatBudget(post.budget)}</span>
                  </div>
                )}
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => handleDeletePost(post.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-md text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-semibold">
                {post.author_name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">{post.author_name}</p>
                <p className="text-xs text-gray-500">{post.author_email}</p>
              </div>
            </div>

            <button
              onClick={() => setActivePostId(post.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-md text-xs font-semibold hover:bg-blue-800 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Responses</span>
              <span className="bg-blue-800 px-1.5 py-0.5 rounded text-xs">
                {post.response_count}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium text-sm">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-lg bg-red-100 flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">Group not found</p>
          <button
            onClick={() => router.push("/groups")}
            className="text-blue-900 hover:underline text-sm font-medium"
          >
            Return to groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
     <div className="w-full px-6 pt-2 pb-6 space-y-3">

        

        {/* Hero Section - Group Info */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-5">
            <div className="flex items-start justify-between gap-6">
              {/* LEFT: Group Info */}
              <div className="flex items-start gap-4 flex-1">
                {/* Icon */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                    {group.name[0].toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white"></div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-xl font-bold text-gray-900">
                      {group.name}
                    </h1>
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 bg-orange-50 text-orange-800 border border-orange-200">
                      <Lock className="w-3 h-3" />
                      PRIVATE
                    </span>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                    {group.description}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md">
                      <Users className="w-3.5 h-3.5 text-blue-900" />
                      <span className="font-medium">Admin:</span>
                      <span>{group.creator_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5 text-blue-900" />
                      <span>{getTimeAgo(group.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: ACTION BUTTONS */}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCreatePostModal(true)}
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    New Post
                  </button>

                  <button
                    onClick={handleDeleteGroup}
                    className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">Total Members</p>
            <p className="text-2xl font-bold text-gray-900">{members.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-purple-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">Total Posts</p>
            <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-teal-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">Chat Messages</p>
            <p className="text-2xl font-bold text-gray-900">{messageCount}</p>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab("posts")}
              className={`relative px-6 py-3 font-semibold text-sm flex items-center gap-2 transition-colors ${
                activeTab === "posts"
                  ? "text-blue-900 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              <FileText className="w-4 h-4" />
              Posts
              {posts.length > 0 && (
                <span className="bg-blue-900 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                  {posts.length}
                </span>
              )}
              {activeTab === "posts" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("members")}
              className={`relative px-6 py-3 font-semibold text-sm flex items-center gap-2 transition-colors ${
                activeTab === "members"
                  ? "text-blue-900 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              <Users className="w-4 h-4" />
              Members
              {members.length > 0 && (
                <span className="bg-blue-900 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                  {members.length}
                </span>
              )}
              {activeTab === "members" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`relative px-6 py-3 font-semibold text-sm flex items-center gap-2 transition-colors ${
                activeTab === "chat"
                  ? "text-blue-900 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
              {messageCount > 0 && (
                <span className="bg-teal-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                  {messageCount}
                </span>
              )}
              {activeTab === "chat" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {activeTab === "posts" && (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-lg bg-blue-900 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No Posts Yet</h3>
                    <p className="text-sm text-gray-600 mb-4">Start the conversation by creating your first post</p>
                    {isAdmin && (
                      <button
                        onClick={() => setShowCreatePostModal(true)}
                        className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create First Post
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {posts.map((post) => (
                      <ProfessionalPostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-4">
                {isAdmin && (
                  <button
                    onClick={() => {
                      fetchAvailableUsers();
                      setShowAddMemberModal(true);
                    }}
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Agency
                  </button>
                )}

                {members.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-lg bg-blue-900 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No Members Yet</h3>
                    <p className="text-sm text-gray-600">Add agencies to start collaborating</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((m) => (
                      <AgencyCard
                        key={`${groupId}-${m.tenant_id}`}
                        agency={m}
                        isCreator={isAdmin}
                        onRemove={() => handleRemoveUser(m.tenant_id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "chat" && (
              <GroupChat
                groupId={groupId}
                tenantId={user?.tenantId}
                userId={user?.id}
                onMessageChange={() => {
                  if (user) {
                    fetchAll(user.id, user.tenantId);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        agents={availableUsers}
        onAddMember={handleAddUser}
      />

      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onSubmit={handleCreatePost}
      />

      <PostResponsesModal
        isOpen={activePostId !== null}
        postId={activePostId}
        userId={user?.id}
        onClose={() => {
          setActivePostId(null);
          if (user?.id) fetchAll(user.id);
        }}
      />
    </div>
  );
}