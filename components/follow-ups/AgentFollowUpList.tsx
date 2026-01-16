"use client";

import { Calendar, MoreHorizontal } from "lucide-react";
import { AlertCircle,  CheckCircle } from "lucide-react";

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
  <div className="space-y-4">
    {followUps.map((followUp) => {
      const isCompleted =
        followUp.status?.toUpperCase() === "DONE" ||
        followUp.status?.toUpperCase() === "COMPLETED";

      return (
        <div
          key={followUp.id}
          className={`bg-white border border-gray-200 rounded-xl px-6 py-4 
          ${!isCompleted ? "hover:shadow-md" : "opacity-70 bg-gray-50"}
          transition`}
        >
          <div className="flex items-start justify-between">
            {/* LEFT */}
            <div className="flex gap-4">
              {/* ICON */}
              <div className="pt-1">{getStatusIcon(followUp.status, followUp.follow_up_date)}
</div>

              {/* CONTENT */}
              <div>
                {/* NAME + PRIORITY */}
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={`text-sm font-semibold text-gray-900 ${
                      isCompleted ? "line-through" : ""
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

                {/* NOTE / PROPERTY */}
                <p className="text-sm text-gray-600 mb-1">
                  {followUp.note || "—"}
                </p>

                {/* META */}
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

                  <span>•</span>

                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium text-[11px]">
                    {followUp.follow_up_type || "TASK"}
                  </span>

                  {followUp.agent_name && (
                    <>
                      <span>•</span>
                      <span>Agent: {followUp.agent_name}</span>
                    </>
                  )}
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
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

}