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
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
      case "MEDIUM":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300";
      case "LOW":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async (id: number) => {
    const ok = confirm("Are you sure you want to delete this follow-up?");
    if (!ok) return;

    await fetch(`/api/follow-ups/${id}`, {
      method: "DELETE",
    });

    // UI refresh ke liye parent ko batao (simple way)
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

    // 🟢 Completed
    if (s === "DONE" || s === "COMPLETED") {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }

    // 🔵 Scheduled explicitly
    if (s === "SCHEDULED") {
      return <Calendar className="w-5 h-5 text-blue-500" />;
    }

    // 🔴 Pending but overdue or today
    if (s === "PENDING" && followDate && followDate <= today) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }

    // 🔵 Pending but future
    if (s === "PENDING" && followDate && followDate > today) {
      return <Calendar className="w-5 h-5 text-blue-500" />;
    }

    return null;
  };



  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Loading follow-ups...
      </div>
    );
  }

  if (followUps.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-4xl mb-2">📋</div>
        <p className="text-muted-foreground font-medium text-sm">No follow-ups found</p>
      </div>
    );
  }




  return (
    <>

      {editFollowUp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Follow-up</h3>

            {/* DATE */}
            <input
              type="date"
              value={editFollowUp.follow_up_date || ""}
              onChange={(e) =>
                setEditFollowUp({
                  ...editFollowUp,
                  follow_up_date: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            />

            {/* TIME */}
            <input
              type="time"
              value={editFollowUp.follow_up_time || ""}
              onChange={(e) =>
                setEditFollowUp({
                  ...editFollowUp,
                  follow_up_time: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            />

            {/* NOTE */}
            <textarea
              placeholder="Note"
              value={editFollowUp.note || ""}
              onChange={(e) =>
                setEditFollowUp({
                  ...editFollowUp,
                  note: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditFollowUp(null)}
                className="px-4 py-2 text-sm border rounded-lg"
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
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {followUps.map((followUp) => {
          const isCompleted =
            followUp.status?.toUpperCase() === "DONE" ||
            followUp.status?.toUpperCase() === "COMPLETED";

          return (
            <div
              key={followUp.id}
              className={`relative bg-white border border-gray-200 rounded-xl px-6 py-4 
            ${!isCompleted ? "hover:shadow-md" : "opacity-70 bg-gray-50"}
            transition`}
            >
              <div className="flex items-start justify-between">
                {/* LEFT */}
                <div className="flex gap-4">
                  <div className="pt-1">
                    {getStatusIcon(
                      followUp.status,
                      followUp.follow_up_date
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`text-sm font-semibold text-gray-900 ${isCompleted ? "line-through" : ""
                          }`}
                      >
                        {followUp.entity_name ||
                          followUp.buyer_name ||
                          followUp.seller_name ||
                          "Unknown"}
                      </h3>

                      {followUp.priority && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getPriorityColor(
                            followUp.priority
                          )}`}
                        >
                          {followUp.priority}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {followUp.note || "—"}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {followUp.follow_up_date
                          ? new Date(
                            followUp.follow_up_date
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                          : "No date"}
                        {followUp.follow_up_time &&
                          `, ${followUp.follow_up_time}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">
                  {!isCompleted && (
                    <button
                      onClick={() => onMarkAsDone(followUp.id)}
                      className="text-xs px-3 py-1.5 bg-green-50 text-green-700 
                    rounded-lg hover:bg-green-100 font-medium"
                    >
                      Mark as Complete
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === followUp.id
                            ? null
                            : followUp.id
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>

                    {openMenuId === followUp.id && (
                      <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                        <button
                          onClick={() => {
                            setEditFollowUp(followUp);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            handleDelete(followUp.id);
                          }}
                          className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                        >
                          🗑 Delete
                        </button>
                      </div>
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