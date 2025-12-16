"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Group {
  id: number;
  name: string;
  description: string;
  creator_name: string;
  created_by: number;
}

interface Member {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
  user_role: string;
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

interface Agent {
  id: number;
  name: string;
  email: string;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = Number(params.id);

  const [user, setUser] = useState<any | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "members">("posts");
  const [isAdmin, setIsAdmin] = useState(false);
  // post responses
const [openPostId, setOpenPostId] = useState<number | null>(null);
const [responses, setResponses] = useState<any[]>([]);
const [replyText, setReplyText] = useState("");


  // Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);

  // New post form
  const [newPost, setNewPost] = useState({
    postType: "requirement",
    title: "",
    description: "",
    location: "",
    budget: "",
  });

  useEffect(() => {
    // Get user from localStorage
    const raw = typeof window !== "undefined" ? localStorage.getItem("loggedUser") : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      setUser(parsed);
      fetchGroupData(parsed.tenantId, parsed.id);
    } else {
      const fallbackUser = { id: 1, tenantId: 1 };
      setUser(fallbackUser);
      fetchGroupData(fallbackUser.tenantId, fallbackUser.id);
    }
  }, [groupId]);

  const fetchGroupData = async (tenantId: number, userId: number) => {
    try {
      setLoading(true);

      // Fetch group details
      const groupRes = await fetch(`/api/groups?tenantId=${tenantId}`);
      const groupsData = await groupRes.json();
      const currentGroup = groupsData.find((g: Group) => g.id === groupId);
      setGroup(currentGroup);

      // Fetch members
      const membersRes = await fetch(`/api/groups/members?groupId=${groupId}`);
      const membersData = await membersRes.json();
      setMembers(membersData);

      // Check if current user is admin
    setIsAdmin(currentGroup?.created_by === userId);


      // Fetch posts
      const postsRes = await fetch(`/api/groups/posts?groupId=${groupId}`);
      const postsData = await postsRes.json();
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching group data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAgents = async () => {
    if (!user) return;
    try {
      const response = await fetch(
        `/api/groups/available-agents?groupId=${groupId}&tenantId=${user.tenantId}`
      );
      const data = await response.json();
      setAvailableAgents(data);
    } catch (error) {
      console.error("Error fetching available agents:", error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newPost.title.trim()) {
      alert("Please enter post title");
      return;
    }

    try {
      const response = await fetch("/api/groups/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          userId: user.id,
          tenantId: user.tenantId,
          postType: newPost.postType,
          title: newPost.title,
          description: newPost.description,
          location: newPost.location,
          budget: newPost.budget ? Number(newPost.budget) : null,
        }),
      });

      if (response.ok) {
        setShowPostModal(false);
        setNewPost({
          postType: "requirement",
          title: "",
          description: "",
          location: "",
          budget: "",
        });
        fetchGroupData(user.tenantId, user.id);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    }
  };

  const handleAddMember = async (agentId: number) => {
    if (!user) return;
    try {
      const response = await fetch("/api/groups/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          userId: agentId,
          role: "MEMBER",
          requesterId: user.id,
        }),
      });

      if (response.ok) {
        fetchGroupData(user.tenantId, user.id);
        fetchAvailableAgents();
        alert("Member added successfully");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!user) return;
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const response = await fetch(
        `/api/groups/members?groupId=${groupId}&userId=${userId}&requesterId=${user.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        fetchGroupData(user.tenantId, user.id);
        alert("Member removed successfully");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    }
  };

  const handleDeleteGroup = async () => {
  if (!user) return;

  const confirmDelete = confirm(
    "Are you sure you want to delete this group? This action cannot be undone."
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `/api/groups?groupId=${groupId}&tenantId=${user.tenantId}&userId=${user.id}`,
      { method: "DELETE" }
    );

    if (response.ok) {
      alert("Group deleted successfully");
      router.push("/groups");
    } else {
      const error = await response.json();
      alert(error.error || "Failed to delete group");
    }
  } catch (error) {
    console.error("Error deleting group:", error);
    alert("Failed to delete group");
  }
};


  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  if (!group) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">Group not found</div>
      </div>
    );
  }
  const fetchResponses = async (postId: number) => {
  const res = await fetch(
    `/api/groups/posts/responses?postId=${postId}`
  );
  const data = await res.json();
  setResponses(data);
};

const submitReply = async () => {
  if (!replyText.trim() || !user || !openPostId) return;

  await fetch("/api/groups/posts/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      postId: openPostId,
      userId: user.id,
      message: replyText,
    }),
  });

  setReplyText("");
  fetchResponses(openPostId);
  fetchGroupData(user.tenantId, user.id);
};


  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => router.push("/groups")}
              className="text-[#c99a2e] hover:text-[#b08926] mb-2 flex items-center gap-1 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Groups
            </button>
            <h1 className="text-2xl font-semibold">{group.name}</h1>
            <p className="text-gray-600 mt-1">{group.description}</p>
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span>Created by {group.creator_name}</span>
              <span>•</span>
              <span>{members.length} members</span>
            </div>
          </div>
          
<div className="flex items-center gap-2">
  <button
    onClick={() => setShowPostModal(true)}
    className="bg-[#c99a2e] hover:bg-[#b08926] text-white px-4 py-2 rounded-full"
  >
    + New Post
  </button>

  {isAdmin && (
    <button
      onClick={handleDeleteGroup}
      className="bg-[#c99a2e] hover:bg-[#b08926] text-white px-4 py-2 rounded-full"
    >
      Delete Group
    </button>
  )}
</div>


        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === "posts"
                  ? "border-[#c99a2e] text-[#c99a2e]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === "members"
                  ? "border-[#c99a2e] text-[#c99a2e]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Members ({members.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No posts yet. Create the first post!
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded mr-2">
                          {post.post_type}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800 inline">
                          {post.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{post.description}</p>
                    {post.location && (
                      <p className="text-sm text-gray-500 mb-1">📍 {post.location}</p>
                    )}
                    {post.budget && (
                      <p className="text-sm text-gray-500 mb-1">
                        💰 Budget: ₹{post.budget.toLocaleString()}
                      </p>
                    )}
                    <button
  onClick={() => {
    setOpenPostId(post.id);
    fetchResponses(post.id);
  }}
  className="text-sm text-[#c99a2e] mt-2"
>
  View / Add Responses
</button>

{openPostId === post.id && (
  <div className="mt-3 border-t pt-3 space-y-2">
    {responses.map((r) => (
      <div key={r.id} className="text-sm text-gray-700">
        <b>{r.author_name}:</b> {r.message}
      </div>
    ))}

    <div className="flex gap-2 mt-2">
      <input
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        className="flex-1 border rounded px-2 py-1 text-sm"
        placeholder="Write a reply..."
      />
      <button
        onClick={submitReply}
        className="bg-[#c99a2e] text-white px-3 rounded text-sm"
      >
        Send
      </button>
    </div>
  </div>
)}

                    <div className="flex justify-between items-center mt-3 pt-3 border-t text-sm text-gray-500">
                      <span>Posted by {post.author_name}</span>
                      <span>{post.response_count} responses</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "members" && (
            <div>
              {isAdmin && (
                <button
                  onClick={() => {
                    fetchAvailableAgents();
                    setShowAddMemberModal(true);
                  }}
                  className="mb-4 bg-[#c99a2e] hover:bg-[#b08926] text-white px-4 py-2 rounded-full text-sm"
                >
                  + Add Member
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{member.name}</h4>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-xs text-gray-400 mt-1">{member.user_role}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          member.role === "ADMIN"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                    {isAdmin && member.user_id !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="mt-3 text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Post</h2>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Post Type *
                </label>
                <select
                  value={newPost.postType}
                  onChange={(e) => setNewPost({ ...newPost, postType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c99a2e]"
                >
                  <option value="requirement">Requirement</option>
                  <option value="offer">Offer</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c99a2e]"
                  placeholder="e.g., Looking for 2BHK in Vastrapur"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c99a2e]"
                  placeholder="Provide details..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newPost.location}
                  onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c99a2e]"
                  placeholder="e.g., Vastrapur, Ahmedabad"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Budget (₹)
                </label>
                <input
                  type="number"
                  value={newPost.budget}
                  onChange={(e) => setNewPost({ ...newPost, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c99a2e]"
                  placeholder="e.g., 5000000"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#c99a2e] hover:bg-[#b08926] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Member</h2>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableAgents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No available agents to add
                </div>
              ) : (
                availableAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium text-gray-800">{agent.name}</div>
                      <div className="text-sm text-gray-500">{agent.email}</div>
                    </div>
                    <button
                      onClick={() => handleAddMember(agent.id)}
                      className="bg-[#c99a2e] hover:bg-[#b08926] text-white px-4 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}