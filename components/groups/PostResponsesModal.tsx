"use client";

import { useEffect, useState } from "react";
import SecondaryButton from "@/components/SecondaryButton";

interface Response {
  id: number;
  message: string;
  user_id: number;
  user_name: string;
  created_at: string;
}

interface Props {
  postId: number | null;
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onResponseAdded?: () => void;
}

export default function PostResponsesModal({
  postId,
  userId,
  isOpen,
  onClose,
  onResponseAdded,
}: Props) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH RESPONSES ---------------- */
  useEffect(() => {
    if (!postId || !isOpen) return;

    fetch(`/api/groups/posts/responses?postId=${postId}`)
      .then((res) => res.json())
      .then(setResponses);
  }, [postId, isOpen]);

  /* ---------------- ADD RESPONSE ---------------- */
  const handleAddResponse = async () => {
    if (!message.trim()) return;

    setLoading(true);

    await fetch("/api/groups/posts/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        userId,
        message,
      }),
    });

    const res = await fetch(
      `/api/groups/posts/responses?postId=${postId}`
    );
    setResponses(await res.json());
    setMessage("");
    setLoading(false);

    if (onResponseAdded) onResponseAdded();
  };

  /* ---------------- DELETE OWN RESPONSE ---------------- */
  const handleDeleteResponse = async (responseId: number) => {
    if (!confirm("Delete this response?")) return;

    await fetch(
      `/api/groups/posts/responses?responseId=${responseId}`,
      { method: "DELETE" }
    );

    const res = await fetch(
      `/api/groups/posts/responses?postId=${postId}`
    );
    setResponses(await res.json());

    if (onResponseAdded) onResponseAdded();
  };

  /* ---------------- TIME FORMAT ---------------- */
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Responses</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* RESPONSES LIST */}
        <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
          {responses.length === 0 && (
            <p className="text-gray-500 text-sm">No responses yet</p>
          )}

          {responses.map((r) => (
            <div
              key={r.id}
              className="border rounded p-3 text-sm relative"
            >
              <p>{r.message}</p>

              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>
                  — {r.user_name}
                  {r.user_id === userId && (
                    <span className="text-[#c99a2e] font-medium">
                      {" "}
                      (You)
                    </span>
                  )}
                </span>

                <span>{formatTime(r.created_at)}</span>
              </div>

              {/* DELETE (ONLY OWN) */}
              {r.user_id === userId && (
                <button
                  onClick={() => handleDeleteResponse(r.id)}
                  className="absolute top-2 right-2 text-red-500 text-xs hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ADD RESPONSE */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a response..."
          className="w-full border rounded p-2 mb-3"
        />

        <div className="flex gap-2">
          <SecondaryButton onClick={onClose} className="flex-1">
            Close
          </SecondaryButton>

          <SecondaryButton
            onClick={handleAddResponse}
            disabled={loading}
            className="flex-1"
          >
            Add Response
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
