"use client";

import { useEffect, useState } from "react";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}


type Props = {
  agentId: number;
  tenantId: number;
};

export default function AgentFollowUpList({ agentId, tenantId }: Props) {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today" | "overdue">("all");


  function isToday(dateStr: string) {
  const today = new Date();
  const d = new Date(dateStr);

  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}



  async function fetchFollowUps() {
    setLoading(true);
   const res = await fetch(
  `/api/follow-ups/agent?agentId=${agentId}&tenantId=${tenantId}&filter=${filter}`
);

   
    const json = await res.json();
    setFollowUps(json.data || []);
    setLoading(false);
  }

  async function markAsDone(id: number) {
    await fetch("/api/follow-ups/update-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        followUpId: id,
        status: "DONE",
      }),
    });

    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "DONE" } : f
      )
    );
  }

  useEffect(() => {
  fetchFollowUps();
}, [filter]);


  /* ---------- STATES ---------- */

  if (loading) {
    return (
      <div className="bg-white/60 rounded-2xl p-8 shadow-sm text-sm text-gray-400">
        Loading follow-ups...
      </div>
    );
  }

  if (followUps.length === 0) {
    return (
      <div className="bg-white/60 rounded-2xl p-8 shadow-sm text-sm text-gray-400">
        No follow-ups assigned to you
      </div>
    );
  }

  /* ---------- UI ---------- */

 return (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {followUps.map((fu) => {
const followUpDate = new Date(fu.follow_up_date);
const todayStart = startOfToday();

const isOverdue =
  fu.status === "PENDING" &&
  followUpDate < todayStart;

const isTodayDate =
  fu.status === "PENDING" &&
  isToday(fu.follow_up_date);



      return (
        <div
  key={fu.id}
  className={`
    rounded-2xl
    p-6
    border
    backdrop-blur
    transition
    flex
    flex-col
    justify-between
    ${
      isOverdue
        ? "bg-red-50 border-red-300 shadow-red-200"
        : isTodayDate
        ? "bg-yellow-50 border-yellow-300 shadow-yellow-200"
        : "bg-white/70 shadow-md hover:shadow-lg"
    }
  `}
>

        
          {/* TOP */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                  {fu.follow_up_type}
                </span>

                <span className="text-xs text-gray-500">
                  {new Date(fu.follow_up_date).toDateString()}
                </span>
              </div>

              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  fu.status === "DONE"
                    ? "bg-green-100 text-green-700"
                    : isOverdue
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {fu.status}
              </span>
            </div>

            {/* BUYER / SELLER NAME */}
            {fu.entity_name && (
              <div className="text-sm">
                <span className="font-semibold text-gray-800">
                  {fu.entity_name}
                </span>
                <span className="text-gray-400 ml-1">
                  ({fu.entity_type})
                </span>
              </div>
            )}

            {/* NOTE */}
            {fu.note && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {fu.note}
              </p>
            )}
          </div>

          {/* ACTION */}
          {fu.status === "PENDING" && (
            <button
              onClick={() => markAsDone(fu.id)}
              className="
                mt-5
                text-sm
                font-medium
                text-indigo-600
                hover:text-indigo-800
                transition
                self-start
              "
            >
              ✔ Mark as Done
            </button>
          )}
        </div>
      );
    })}
  </div>
);
}