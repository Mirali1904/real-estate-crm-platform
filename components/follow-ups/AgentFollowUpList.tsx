"use client";

import { Calendar, MoreHorizontal } from "lucide-react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";


interface FollowUp {
  id: number;
  entity_name?: string;
  buyer_name?: string;
  seller_name?: string;
  note?: string;
  follow_up_date?: string;
  follow_up_time?: string;
  follow_up_type?: string;
  status: string;
  priority?: string;
  agent_id?: number;
  agent_name?: string;
}

interface AgentFollowUpListProps {
  followUps: FollowUp[];
  loading: boolean;
  onMarkAsDone: (id: number) => void;
}

export default function AgentFollowUpList({
  followUps,
  loading,
  onMarkAsDone,
}: AgentFollowUpListProps) {

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editFollowUp, setEditFollowUp] = useState<FollowUp | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
      case "LOW":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
    }
  };

  const handleDelete = async (id: number) => {
    const ok = confirm("Are you sure you want to delete this follow-up?");
    if (!ok) return;

    await fetch(`/api/follow-ups/${id}`, {
      method: "DELETE",
    });

    window.location.reload();
  };

  const getStatusIcon = (
    status: string,
    followUpDate?: string
  ) => {
    const s = status?.toUpperCase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const followDate = followUpDate ? new Date(followUpDate) : null;
    if (followDate) followDate.setHours(0, 0, 0, 0);

    // Completed
    if (s === "DONE" || s === "COMPLETED") {
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    }

    // Scheduled
    if (s === "SCHEDULED") {
      return <Calendar className="w-5 h-5 text-blue-500" />;
    }

    // Overdue
    if (s === "PENDING" && followDate && followDate <= today) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }

    // Future
    if (s === "PENDING" && followDate && followDate > today) {
      return <Calendar className="w-5 h-5 text-gray-500" />;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading follow-ups...</p>
        </div>
      </div>
    );
  }

  if (followUps.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-1">No follow-ups found</p>
          <p className="text-gray-500 text-sm">All follow-ups are up to date</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Edit Modal */}
      {editFollowUp && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Edit Follow-up</h3>

            <div className="space-y-5">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={editFollowUp.follow_up_date || ""}
                  onChange={(e) =>
                    setEditFollowUp({
                      ...editFollowUp,
                      follow_up_date: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={editFollowUp.follow_up_time || ""}
                  onChange={(e) =>
                    setEditFollowUp({
                      ...editFollowUp,
                      follow_up_time: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Add your notes here..."
                  value={editFollowUp.note || ""}
                  onChange={(e) =>
                    setEditFollowUp({
                      ...editFollowUp,
                      note: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setEditFollowUp(null)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await fetch(`/api/follow-ups/${editFollowUp.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editFollowUp),
                  });
                  setEditFollowUp(null);
                  window.location.reload();
                }}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-ups List */}
      <div className="space-y-3">
        {followUps.map((followUp) => {
          const isCompleted =
            followUp.status?.toUpperCase() === "DONE" ||
            followUp.status?.toUpperCase() === "COMPLETED";

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const followDate = followUp.follow_up_date ? new Date(followUp.follow_up_date) : null;
          if (followDate) followDate.setHours(0, 0, 0, 0);
          const isOverdue = followDate && followDate < today && !isCompleted;

          return (
            <div
              key={followUp.id}
              className={`bg-white rounded-xl border transition-all ${
                isCompleted 
                  ? "border-gray-200 bg-gray-50/50" 
                  : isOverdue
                  ? "border-red-200 hover:border-red-300 hover:shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="p-5 flex items-start gap-4">
                {/* Status Icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {getStatusIcon(followUp.status, followUp.follow_up_date)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2.5">
                    <h3
                      className={`text-base font-semibold ${
                        isCompleted ? "line-through text-gray-500" : "text-gray-900"
                      }`}
                    >
                      {followUp.entity_name ||
                        followUp.buyer_name ||
                        followUp.seller_name ||
                        followUp.agent_name ||
                        "Unknown"}
                    </h3>

                    {followUp.priority && (
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${getPriorityColor(
                          followUp.priority
                        )}`}
                      >
                        {followUp.priority}
                      </span>
                    )}

                    {isOverdue && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-md ring-1 ring-red-200">
                        Overdue
                      </span>
                    )}
                  </div>

                  {followUp.note && (
                    <p className="text-sm text-gray-600 mb-2.5 line-clamp-2">
                      {followUp.note}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {followUp.follow_up_date
                        ? new Date(followUp.follow_up_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })
                        : "No date"}
                      {followUp.follow_up_time && ` • ${followUp.follow_up_time}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isCompleted && (
                    <button
                      onClick={() => onMarkAsDone(followUp.id)}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Complete
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === followUp.id ? null : followUp.id)
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-500" />
                    </button>

                    {openMenuId === followUp.id && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />

                        {/* Menu */}
                        <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                          <button
                            onClick={() => {
                              setEditFollowUp(followUp);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-left transition-colors"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              handleDelete(followUp.id);
                            }}
                            className="w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 text-left transition-colors border-t border-gray-100"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}