"use client";

import { useState } from "react";

type FollowUp = {
  id: number;
  buyer_name: string;
  seller_name?: string;
  follow_up_type: string;
  follow_up_date: string;
  status: string;
};

type FollowUpItemProps = {
  followUp: FollowUp;
  onStatusChange: () => void;
};

export default function FollowUpItem({
  followUp,
  onStatusChange,
}: FollowUpItemProps) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(
    status: "DONE" | "NO_RESPONSE" | "NOT_INTERESTED"
  ) {
    try {
      setLoading(true);

      const res = await fetch("/api/follow-ups/update-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followUpId: followUp.id,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      onStatusChange();
    } catch (error) {
      console.error("Update follow-up failed", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-md p-3 flex justify-between items-start bg-white">
      <div className="space-y-1">
        <div className="font-medium">{followUp.buyer_name}</div>

        {followUp.seller_name && (
          <div className="text-sm text-gray-500">
            Property: {followUp.seller_name}
          </div>
        )}

        <div className="text-sm text-gray-500">
          {followUp.follow_up_type} • {followUp.follow_up_date}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          disabled={loading}
          onClick={() => updateStatus("DONE")}
          className="text-xs bg-green-600 text-white px-2 py-1 rounded disabled:opacity-60"
        >
          Done
        </button>

        <button
          disabled={loading}
          onClick={() => updateStatus("NO_RESPONSE")}
          className="text-xs bg-yellow-500 text-white px-2 py-1 rounded disabled:opacity-60"
        >
          No Response
        </button>

        <button
          disabled={loading}
          onClick={() => updateStatus("NOT_INTERESTED")}
          className="text-xs bg-red-600 text-white px-2 py-1 rounded disabled:opacity-60"
        >
          Not Interested
        </button>
      </div>
    </div>
  );
}
