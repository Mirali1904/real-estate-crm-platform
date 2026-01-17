"use client";

import { useEffect, useState } from "react";

interface PostCardProps {
  post: {
    id: number;
    post_type: string;
    seller_id?: number;
    title: string;
    description?: string;

    // Generic
    location?: string;
    budget?: number;

    // Buyer-specific
    buyer_name?: string;
    buyer_requirement?: string;
    buyer_location?: string;
    buyer_budget_min?: number;
    buyer_budget_max?: number;

    // Seller-specific
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
  /* ================= SELLER IMAGES STATE ================= */
  const [photos, setPhotos] = useState<any[]>([]);
  const [showPhotos, setShowPhotos] = useState(false);

  /* ================= LOAD SELLER PHOTOS ================= */
  useEffect(() => {
  if (post.post_type !== "seller") return;
  if (!post.seller_id) return;

  async function loadSellerPhotos() {
    try {
      const res = await fetch(`/api/groups/seller-photos?sellerId=${post.seller_id}`);


      if (res.ok) {
        const data = await res.json();
        setPhotos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load seller photos", err);
    }
  }

  loadSellerPhotos();
}, [post.post_type, post.seller_id]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium uppercase">
            {post.post_type}
          </span>
          <h3 className="text-base font-semibold text-gray-900">
            {post.title}
          </h3>
        </div>

        <button
          onClick={onDelete}
          className="text-xs text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>

      {/* ================= BUYER POST ================= */}
      {post.post_type === "buyer" ? (
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <span className="font-medium">Buyer:</span>{" "}
            {post.buyer_name || post.author_name}
          </p>

          {(post.buyer_requirement || post.description) && (
            <p>
              <span className="font-medium">Requirement:</span>{" "}
              {post.buyer_requirement || post.description}
            </p>
          )}

          {(post.buyer_location || post.location) && (
            <p className="text-gray-600">
              📍 {post.buyer_location || post.location}
            </p>
          )}

          {(post.buyer_budget_min ||
            post.buyer_budget_max ||
            post.budget) && (
            <p className="text-gray-600">
              💰 ₹
              {post.buyer_budget_min ?? post.budget ?? "—"}
              {post.buyer_budget_max
                ? ` – ₹${post.buyer_budget_max}`
                : ""}
            </p>
          )}
        </div>
      ) : (
        /* ================= SELLER / NORMAL POST ================= */
        <div className="text-sm text-gray-700 space-y-1">
          {post.description && (
            <p className="text-gray-700">{post.description}</p>
          )}

          {post.location && (
            <p className="text-gray-600">📍 {post.location}</p>
          )}

          {post.budget && (
            <p className="text-gray-600">💰 ₹{post.budget}</p>
          )}

          {/* ===== SHOW IMAGES BUTTON ===== */}
          {post.post_type === "seller" && photos.length > 0 && (
            <button
              onClick={() => setShowPhotos(!showPhotos)}
              className="text-xs text-blue-600 underline mt-2"
            >
              {showPhotos ? "Hide Images" : "Show Images"}
            </button>
          )}

          {/* ===== SELLER IMAGES GRID ===== */}
          {showPhotos && photos.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {photos.slice(0, 4).map((photo) => (
                <img
                  key={photo.id}
                  src={photo.photo_url}
                  alt="property"
                  className="h-28 w-full object-cover rounded-lg border"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t text-xs text-gray-500">
        <span>
          Posted by{" "}
          <span className="font-medium text-gray-700">
            {post.author_name}
          </span>
        </span>

        <button
          onClick={onViewResponses}
          className="text-blue-600 hover:underline font-medium"
        >
          Responses ({post.response_count})
        </button>
      </div>
    </div>
  );
}
