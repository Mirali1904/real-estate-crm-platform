
"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";

export default function FollowUpsPage() {
  const [agentId, setAgentId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "scheduled" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;
    const user = JSON.parse(raw);
    setAgentId(user.id);
    setTenantId(user.tenant_id ?? user.tenantId);
  }, []);

  useEffect(() => {
    if (!agentId || !tenantId) return;
    fetchFollowUps();
  }, [agentId, tenantId]);

  async function fetchFollowUps() {
    setLoading(true);
    try {
      const res = await fetch(`/api/follow-ups/agent?agentId=${agentId}&tenantId=${tenantId}&filter=all`);
      const json = await res.json();
      setFollowUps(json.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function markAsDone(id: number) {
    await fetch("/api/follow-ups/update-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpId: id, status: "DONE" }),
    });
    setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, status: "DONE" } : f)));
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-orange-100 text-orange-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DONE":
      case "COMPLETED":
        return "✓";
      case "SCHEDULED":
        return "📅";
      case "PENDING":
        return "⏰";
      default:
        return "⏱";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DONE":
      case "COMPLETED":
        return "text-green-600";
      case "SCHEDULED":
        return "text-blue-600";
      case "PENDING":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredFollowUps = followUps
    .filter((fu) => {
      if (activeTab === "all") return true;
      if (activeTab === "pending") return fu.status === "PENDING";
      if (activeTab === "scheduled") return fu.status === "SCHEDULED";
      if (activeTab === "completed") return fu.status === "DONE" || fu.status === "COMPLETED";
      return true;
    })
    .filter((fu) => {
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();
      return (
        fu.entity_name?.toLowerCase().includes(search) ||
        fu.note?.toLowerCase().includes(search) ||
        fu.follow_up_type?.toLowerCase().includes(search)
      );
    });

  if (!agentId || !tenantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
            <p className="text-sm text-gray-500 mt-1">Track all pending and scheduled follow-ups</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Follow-up
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Search & Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search follow-ups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "pending"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("scheduled")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "scheduled"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "completed"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Follow-ups List */}
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading follow-ups...</div>
            ) : filteredFollowUps.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-3">📋</div>
                <p className="text-gray-500 font-medium">No follow-ups found</p>
              </div>
            ) : (
              filteredFollowUps.map((followUp) => (
                <div
                  key={followUp.id}
                  className={`bg-white border-2 rounded-xl shadow-sm p-5 hover:shadow-md transition-all ${
                    followUp.status === "DONE" || followUp.status === "COMPLETED"
                      ? "opacity-60 border-gray-200"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left - Status Icon & Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`mt-1 text-2xl ${getStatusColor(followUp.status)}`}>
                        {getStatusIcon(followUp.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3
                            className={`font-semibold text-gray-900 ${
                              followUp.status === "DONE" || followUp.status === "COMPLETED" ? "line-through" : ""
                            }`}
                          >
                            {followUp.entity_name || "Unknown"}
                          </h3>
                          {followUp.priority && (
                            <span
                              className={`${getPriorityColor(
                                followUp.priority
                              )} px-2 py-0.5 rounded-full text-xs font-medium`}
                            >
                              {followUp.priority}
                            </span>
                          )}
                        </div>
                        {followUp.note && <p className="text-sm text-gray-600 mb-2">{followUp.note}</p>}
                        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                          <span>📅 {new Date(followUp.follow_up_date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                            {followUp.follow_up_type}
                          </span>
                          <span>•</span>
                          <span className="text-gray-500">
                            {followUp.entity_type === "buyer" ? "Buyer" : "Seller"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right - Actions */}
                    <div className="flex items-center gap-2">
                      {followUp.status === "PENDING" && (
                        <button
                          onClick={() => markAsDone(followUp.id)}
                          className="text-sm px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                        >
                          Mark as Complete
                        </button>
                      )}
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <span className="text-gray-400">⋯</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


