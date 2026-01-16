"use client";

import { useEffect, useState } from "react";
import { Plus, Filter } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AgentFollowUpList from "@/components/follow-ups/AgentFollowUpList";
import FollowUpForm from "@/components/follow-ups/FollowUpForm";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}



export default function FollowUpsPage() {
  const [agentId, setAgentId] = useState<number | null>(null);
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "scheduled" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);


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

  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const filteredFollowUps = followUps
    // 🔍 SEARCH FILTER (FIRST)
    .filter((fu) => {
      if (!searchQuery) return true;

      const q = searchQuery.toLowerCase();

      return (
        fu.entity_name?.toLowerCase().includes(q) ||
        fu.note?.toLowerCase().includes(q) ||
        fu.follow_up_type?.toLowerCase().includes(q)
      );
    })

    // 📅 TAB FILTER (SECOND)
    .filter((fu) => {
      const followUpDate = new Date(fu.follow_up_date);
      followUpDate.setHours(0, 0, 0, 0);

      // 🟦 ALL → sab active
      if (activeTab === "all") {
        return fu.status !== "DONE" && fu.status !== "COMPLETED";
      }

      // 🟨 PENDING → sirf AAJ
      if (activeTab === "pending") {
        return (
          fu.status === "PENDING" &&
          followUpDate.getTime() === today.getTime()
        );
      }

      // 🟪 SCHEDULED → sirf KAL
      if (activeTab === "scheduled") {
        return (
          fu.status === "PENDING" &&
          followUpDate.getTime() === tomorrow.getTime()
        );
      }

      // 🟩 COMPLETED
      if (activeTab === "completed") {
        return fu.status === "DONE" || fu.status === "COMPLETED";
      }

      return false;
    });




  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-56">
        <Header />

        <div className="p-6">
          {/* Search + Add Follow-up */}
          <div className="flex items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search follow-ups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
                <Filter className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Add Follow-up Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Follow-up
            </button>

          </div>


          {/* Tabs (Outside the card) */}
          <div className="flex gap-1 mb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "all"
                  ? "bg-white text-blue-600 border-t border-l border-r border-gray-200"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "pending"
                  ? "bg-white text-blue-600 border-t border-l border-r border-gray-200"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("scheduled")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "scheduled"
                  ? "bg-white text-blue-600 border-t border-l border-r border-gray-200"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "completed"
                  ? "bg-white text-blue-600 border-t border-l border-r border-gray-200"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              Completed
            </button>
          </div>

          {/* White Card Container */}
          <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-200 shadow-sm p-6">
            <AgentFollowUpList
              followUps={filteredFollowUps}
              loading={loading}
              onMarkAsDone={markAsDone}
            />
          </div>

          {/* ADD FOLLOW-UP MODAL */}
          {showAddModal && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={() => setShowAddModal(false)}
              />

              {/* Modal */}
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">

                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Add Follow-up
                    </h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  {/* FORM */}
                  <FollowUpForm
                    tenantId={tenantId!}
                    agentId={agentId!}
                    onSuccess={() => {
                      setShowAddModal(false);
                      fetchFollowUps(); // refresh list
                    }}
                  />
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}