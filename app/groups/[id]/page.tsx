"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AddMemberModal from "@/components/groups/AddMemberModal";
import AgencyCard from "@/components/groups/AgencyCard";
import CreatePostModal from "@/components/groups/CreatePostModal";
import PostCard from "@/components/groups/PostCard";
import SecondaryButton from "@/components/SecondaryButton";
import PostResponsesModal from "@/components/groups/PostResponsesModal";

import GroupChat from "@/components/groups/GroupChat";




/* ================= TYPES ================= */

interface Group {
  id: number;
  name: string;
  description: string;
  creator_name: string;
  created_by: number;
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

/* ================= PAGE ================= */

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
 const [activeTab, setActiveTab] =
  useState<"posts" | "members" | "chat">("posts");

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

  // ✅ ONLY THIS FUNCTION ADDED
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

  /* ================= UI ================= */

  if (loading) return <div className="p-6">Loading...</div>;
  if (!group) return <div className="p-6">Group not found</div>;

  return (
    <div className="w-full p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-start">
        <div>
          <button
            onClick={() => router.push("/groups")}
            className="text-indigo-600 text-sm mb-2"
          >
            ← Back to Groups
          </button>

          <h1 className="text-2xl font-semibold">{group.name}</h1>
          <p className="text-gray-600">{group.description}</p>

          <p className="text-sm text-gray-400 mt-1">
            Created by {group.creator_name} • {members.length} members
          </p>
        </div>

        {/* ✅ ONLY DELETE BUTTON ADDED */}
        {isAdmin && (
          <div className="flex gap-2">
            <SecondaryButton
              onClick={() => setShowCreatePostModal(true)}
              className="bg-indigo-600 text-white border-none hover:bg-indigo-700"
            >
              + New Post
            </SecondaryButton>

            <SecondaryButton
              onClick={handleDeleteGroup}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete Group
            </SecondaryButton>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="border-b px-6 flex gap-8">
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-4 border-b-2 text-sm ${
              activeTab === "posts"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Posts ({posts.length})
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`py-4 border-b-2 text-sm ${
              activeTab === "members"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Members ({members.length})
          </button>

          <button
  onClick={() => setActiveTab("chat")}
  className={`py-4 border-b-2 text-sm ${
    activeTab === "chat"
      ? "border-indigo-600 text-indigo-600"
      : "border-transparent text-gray-500"
  }`}
>
  Chat
</button>
        </div>

        <div className="p-6">
          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onViewResponses={() => setActivePostId(post.id)}
                  onDelete={() => handleDeletePost(post.id)}
                />
              ))}
            </div>
          )}

          {activeTab === "members" && (
            <>
              {isAdmin && (
                <SecondaryButton
                  className="mb-4 bg-indigo-600 text-white border-none hover:bg-indigo-700"
                  onClick={() => {
                    fetchAvailableUsers();
                    setShowAddMemberModal(true);
                  }}
                >
                  + Add Agency
                </SecondaryButton>
              )}

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
            </>
          )}

          {activeTab === "chat" && (
  <GroupChat
    groupId={groupId}
    tenantId={user.tenantId}
    userId={user.id}
  />
)}
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
