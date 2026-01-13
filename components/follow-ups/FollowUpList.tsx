"use client";

import { useEffect, useState } from "react";

type FollowUpListProps = {
  buyerId?: number;
  agentId?: number;
  tenantId?: number;
};

export default function FollowUpList({
  buyerId,
  agentId,
  tenantId,
}: FollowUpListProps) {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today" | "overdue">("all");


  async function fetchFollowUps() {
    setLoading(true);

    let url = "";

    if (buyerId) {
      url = `/api/follow-ups?buyerId=${buyerId}`;
    } else if (agentId && tenantId) {
      url = `/api/follow-ups/agent?agentId=${agentId}&tenantId=${tenantId}&filter=${filter}`;
    }
    else {
      setFollowUps([]);
      setLoading(false);
      return;
    }

    const res = await fetch(url);
    const data = await res.json();

    setFollowUps(data.data || data || []);
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
  }, [buyerId, agentId, tenantId, filter]);

  if (loading) {
    return (
      <>
        {/* FILTERS (only for agent view) */}
        {!buyerId && (
          <div className="flex gap-2 mb-6">
            {[
              { key: "all", label: "All" },
              { key: "today", label: "Today" },
              { key: "overdue", label: "Overdue" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`
            px-4 py-1.5 text-sm rounded-full border transition
            ${filter === f.key
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                  }
          `}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <div className="bg-gray-50 border rounded-xl p-6 text-sm text-gray-400">
          Loading follow-ups...
        </div>
      </>
    );

  }

  if (followUps.length === 0) {
    return (
      <div className="bg-gray-50 border rounded-xl p-6 text-sm text-gray-400">
        No follow-ups found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {followUps.map((fu) => (
        <div
          key={fu.id}
          className="
  bg-white
  rounded-xl
  border border-slate-200
  shadow-sm
  p-4
  flex
  justify-between
  items-start
  hover:shadow-md
  transition
"

        >

          {/* LEFT */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                {fu.follow_up_type}
              </span>


              <span className="text-xs text-gray-500">
                {new Date(fu.follow_up_date).toDateString()}
              </span>
            </div>

            {fu.entity_name && (
              <div className="text-sm font-medium text-gray-800">
                {fu.entity_name}{" "}
                <span className="text-gray-400 font-normal">
                  ({fu.entity_type})
                </span>
              </div>
            )}

            {fu.note && (
              <p className="text-sm text-gray-700 leading-relaxed">
                {fu.note}
              </p>

            )}
          </div>

          {/* RIGHT */}
          <div className="flex flex-col items-end gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${fu.status === "DONE"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
                }`}
            >

              {fu.status}
            </span>

            {fu.status === "PENDING" && (
              <button
                onClick={() => markAsDone(fu.id)}
                className="text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                ✓ Mark as Done
              </button>

            )}
          </div>
        </div>
      ))}
    </div>
  );
}
