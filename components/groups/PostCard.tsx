interface PostCardProps {
  post: {
    id: number;
    post_type: string;
    title: string;
    description?: string;

    // Generic
    location?: string;
    budget?: number;

    // Buyer-specific (from JOIN)
    buyer_name?: string;
    buyer_requirement?: string;
    buyer_location?: string;
    buyer_budget_min?: number;
    buyer_budget_max?: number;

    // Seller-specific (future safe)
    seller_name?: string;
    seller_price?: number;
    seller_bedrooms?: number;

    author_name: string;
    response_count: number;
    created_at: string;
  };
  onViewResponses: () => void;
  onDelete: () => void;
}

export default function PostCard({
  post,
  onViewResponses,
  onDelete,
}: PostCardProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-4">
      {/* HEADER */}
      <div className="mb-2 flex justify-between items-start">
        <div>
          <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded mr-2">
            {post.post_type}
          </span>
          <h3 className="text-lg font-semibold inline">
            {post.title}
          </h3>
        </div>

        <button
          onClick={onDelete}
          className="text-red-500 text-xs hover:underline"
        >
          Delete
        </button>
      </div>

      {/* ================= BUYER POST ================= */}
      {post.post_type === "buyer" && post.buyer_name ? (
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Buyer:</strong> {post.buyer_name}</p>

          {post.buyer_requirement && (
            <p><strong>Requirement:</strong> {post.buyer_requirement}</p>
          )}

          {post.buyer_location && (
            <p>📍 {post.buyer_location}</p>
          )}

          {(post.buyer_budget_min || post.buyer_budget_max) && (
            <p>
              💰 ₹{post.buyer_budget_min ?? "—"} – ₹{post.buyer_budget_max ?? "—"}
            </p>
          )}
        </div>
      ) : (
        /* ================= NORMAL POST ================= */
        <>
          {post.description && (
            <p className="text-gray-700 mb-2">{post.description}</p>
          )}

          {post.location && <p className="text-sm">📍 {post.location}</p>}
          {post.budget && <p className="text-sm">💰 ₹{post.budget}</p>}
        </>
      )}

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
        <span>Posted by {post.author_name}</span>

        <button
          onClick={onViewResponses}
          className="text-[#c99a2e] hover:underline"
        >
          View / Add Responses ({post.response_count})
        </button>
      </div>
    </div>
  );
}
