"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, Users, FileText, MessageSquare, Plus, Trash2 } from "lucide-react";

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
    fetchAll(u.id);
  }, [groupId]);

  /* ================= FETCH ALL ================= */
  const fetchAll = async (userId: number) => {
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
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths >= 1) {
      return `Created ${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
    return 'Created recently';
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Group not found</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-3 space-y-6">

        
        

        {/* Group Info Card */}
        {/* Group Info Card */}
<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-gray-200">
  <div className="flex items-start justify-between gap-4">

    {/* LEFT: Group Info */}
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
        {group.name[0].toUpperCase()}
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
          <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-orange-100 text-orange-800">
            <Lock className="w-3 h-3" />
            Private
          </span>
        </div>
        <p className="text-gray-700 mb-2">{group.description}</p>
        <p className="text-sm text-gray-500">
          Admin: {group.creator_name} • {getTimeAgo(group.created_at)}
        </p>
      </div>
    </div>

    {/* RIGHT: ACTION BUTTONS */}
    {isAdmin && (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowCreatePostModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>

        <button
          onClick={handleDeleteGroup}
          className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    )}

  </div>
</div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <Users className="w-4 h-4" />
              <span>Members</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">{members.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <FileText className="w-4 h-4" />
              <span>Posts</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">{posts.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-6 py-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === "posts"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="w-4 h-4" />
              Posts
              {posts.length > 0 && (
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {posts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-6 py-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === "members"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              Members
              {members.length > 0 && (
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {members.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-6 py-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === "chat"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "posts" && (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No posts yet</p>
                    {isAdmin && (
                      <button
                        onClick={() => setShowCreatePostModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Create your first post
                      </button>
                    )}
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onViewResponses={() => setActivePostId(post.id)}
                      onDelete={() => handleDeletePost(post.id)}
                    />
                  ))
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
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Agency
                  </button>
                )}

                {members.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No members yet</p>
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