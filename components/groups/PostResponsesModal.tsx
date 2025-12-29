"use client";

import { useEffect, useState } from "react";
import SecondaryButton from "@/components/SecondaryButton";

interface Response {
  id: number;
  message: string;
  user_id: number;
  author_name: string;
  author_email?: string;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Responses
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* RESPONSES */}
        <div className="px-6 py-4 max-h-72 overflow-y-auto space-y-4">
          {responses.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No responses yet
            </p>
          )}

          {responses.map((r) => (
            <div
              key={r.id}
              className="bg-gray-50 rounded-xl p-4 relative"
            >
              <p className="text-sm text-gray-800 mb-2">
                {r.message}
              </p>

              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {r.author_name}
                  {r.author_email ? ` • ${r.author_email}` : ""}
                </span>
                <span>
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>

              {/* DELETE (ONLY OWN RESPONSE) */}
              {r.user_id === userId && (
                <button
                  onClick={() => handleDeleteResponse(r.id)}
                  className="absolute top-2 right-3 text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ADD RESPONSE */}
        <div className="px-6 py-4 border-t">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a response..."
            className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
            rows={3}
          />

          <div className="flex gap-3">
            <SecondaryButton onClick={onClose} className="flex-1">
              Close
            </SecondaryButton>

            <SecondaryButton
              onClick={handleAddResponse}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Posting..." : "Add Response"}
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
