"use client";

import { useState } from "react";

type FollowUpFormProps = {
  tenantId: number;
 buyerId?: number;

  agentId: number;
  sellerId?: number; // optional
  onSuccess?: () => void; // list refresh ke liye
};

export default function FollowUpForm({
  tenantId,
  buyerId,
  agentId,
  sellerId,
  onSuccess,
}: FollowUpFormProps) {
  const [followUpType, setFollowUpType] = useState("CALL");
  const [followUpDate, setFollowUpDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUpTime, setFollowUpTime] = useState("");


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!followUpDate || !followUpTime) {
  setError("Follow-up date and time are required");
  return;
}

    try {
      setLoading(true);

      const res = await fetch("/api/follow-ups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          buyerId,
          sellerId,
          agentId,
          followUpType,
          followUpDate,
          followUpTime,
          note,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create follow-up");
      }

      // reset form
      setFollowUpDate("");
      setNote("");
      setFollowUpType("CALL");
      setFollowUpTime("");


      onSuccess?.();
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4">

    
     


      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Follow-up Type */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Follow-up Type
        </label>
        <select
          value={followUpType}
          onChange={(e) => setFollowUpType(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500"


        >
          <option value="CALL">Call</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="VISIT">Visit</option>
          <option value="EMAIL">Email</option>
        </select>
      </div>

      {/* Follow-up Date */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Follow-up Date
        </label>
        <input
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Follow-up Time */}
<div>
  <label className="block text-sm font-medium mb-1">
    Follow-up Time
  </label>
  <input
    type="time"
    value={followUpTime}
    onChange={(e) => setFollowUpTime(e.target.value)}
    className="w-full border rounded px-3 py-2"
  />
</div>


      {/* Note */}
      <div>
        <label className="block text-sm font-medium mb-1">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="e.g. buyer not responding"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
       className="w-full bg-blue-600 hover:bg-blue-700
text-white px-4 py-2 rounded-lg text-sm font-medium
transition disabled:opacity-60"

      >
        {loading ? "Saving..." : "Save Follow-up"}
      </button>
    </form>
  );
}
