"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AddMemberModal from "@/components/groups/AddMemberModal";
import AgencyCard from "@/components/groups/AgencyCard";
import CreatePostModal from "@/components/groups/CreatePostModal";
import PostCard from "@/components/groups/PostCard";
import SecondaryButton from "@/components/SecondaryButton";
import PostResponsesModal from "@/components/groups/PostResponsesModal";

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
  author_name: string;
  response_count: number;
  created_at: string;
}

interface Agency {
  id: number;
  agency_id: number;
  name: string;
  email: string;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = Number(params.id);

  const [user, setUser] = useState<any>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [availableAgencies, setAvailableAgencies] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"posts" | "members">("posts");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // ✅ RESPONSE STATE
  const [activePostId, setActivePostId] = useState<number | null>(null);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const u = JSON.parse(raw);
    setUser(u);
    fetchAll(u.id);
  }, [groupId]);

  /* ---------------- FETCH ALL ---------------- */
  const fetchAll = async (userId: number) => {
    setLoading(true);

    const gRes = await fetch(`/api/groups/${groupId}`);
    const g = await gRes.json();
    setGroup(g);
    setIsAdmin(g.created_by === userId);

    const pRes = await fetch(`/api/groups/posts?groupId=${groupId}`);
    setPosts(await pRes.json());

    const aRes = await fetch(`/api/groups/agencies?groupId=${groupId}`);
    setAgencies(await aRes.json());

    setLoading(false);
  };

  /* ---------------- AVAILABLE ADMINS ---------------- */
  const fetchAvailableAgencies = async () => {
    if (!user) return;

    const res = await fetch(
      `/api/groups/available-agencies?groupId=${groupId}&currentUserId=${user.id}`
    );

    const data = await res.json();
    setAvailableAgencies(data.filter((a: any) => a.id !== user.id));
  };

  /* ---------------- ACTIONS ---------------- */
  const handleAddAgency = async (agencyId: number) => {
    await fetch("/api/groups/agencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, agencyId }),
    });

    await fetchAll(user.id);
    await fetchAvailableAgencies();
    setShowAddMemberModal(false);
  };

  const handleRemoveAgency = async (agencyId: number) => {
    await fetch(
      `/api/groups/agencies?groupId=${groupId}&agencyId=${agencyId}`,
      { method: "DELETE" }
    );
    fetchAll(user.id);
  };

  const handleDeleteGroup = async () => {
  if (!confirm("Are you sure you want to delete this group?")) return;

  const res = await fetch(
    `/api/groups?groupId=${groupId}&tenantId=${user.tenantId}&userId=${user.id}`,
    { method: "DELETE" }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "You are not allowed to delete this group");
    return;
  }

  router.push("/groups");
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

  /* ---------------- UI ---------------- */
  if (loading) return <div className="p-6">Loading...</div>;
  if (!group) return <div className="p-6">Group not found</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-start">
        <div>
          <button
            onClick={() => router.push("/groups")}
            className="text-[#c99a2e] mb-2"
          >
            ← Back to Groups
          </button>

          <h1 className="text-2xl font-semibold">{group.name}</h1>
          <p className="text-gray-600">{group.description}</p>
          <p className="text-sm text-gray-500 mt-1">
            Created by {group.creator_name} • {agencies.length} members
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <SecondaryButton onClick={() => setShowCreatePostModal(true)}>
              + New Post
            </SecondaryButton>

            <SecondaryButton
              onClick={handleDeleteGroup}
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Delete Group
            </SecondaryButton>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b px-6 flex gap-8">
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-4 border-b-2 ${
              activeTab === "posts"
                ? "border-[#c99a2e] text-[#c99a2e]"
                : "border-transparent text-gray-500"
            }`}
          >
            Posts ({posts.length})
          </button>

          <button
            onClick={() => setActiveTab("members")}
            className={`py-4 border-b-2 ${
              activeTab === "members"
                ? "border-[#c99a2e] text-[#c99a2e]"
                : "border-transparent text-gray-500"
            }`}
          >
            Members ({agencies.length})
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
                />
              ))}
            </div>
          )}

          {activeTab === "members" && (
            <>
              {isAdmin && (
                <SecondaryButton
                  className="mb-4"
                  onClick={() => {
                    fetchAvailableAgencies();
                    setShowAddMemberModal(true);
                  }}
                >
                  + Add Member
                </SecondaryButton>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agencies.map((agency) => (
                  <AgencyCard
                    key={agency.id}
                    agency={agency}
                    isCreator={isAdmin}
                    onRemove={() => handleRemoveAgency(agency.agency_id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        agents={availableAgencies}
        onAddMember={handleAddAgency}
      />

      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onSubmit={handleCreatePost}
      />

      {/* ✅ RESPONSE MODAL (FIXED) */}
      <PostResponsesModal
        isOpen={activePostId !== null}
        postId={activePostId}
        userId={user?.id}
        onClose={() => {
          setActivePostId(null);
          if (user?.id) fetchAll(user.id); // refresh counts
        }}
      />
    </div>
  );
}
