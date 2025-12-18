interface PostCardProps {
  post: {
    id: number;
    post_type: string;
    title: string;
    description: string;
    location?: string;
    budget?: number;
    author_name: string;
    response_count: number;
    created_at: string;
  };
  onViewResponses: () => void;
}

export default function PostCard({ post, onViewResponses }: PostCardProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <div className="mb-2">
        <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded mr-2">
          {post.post_type}
        </span>
        <h3 className="text-lg font-semibold inline">{post.title}</h3>
      </div>

      <p className="text-gray-700 mb-2">{post.description}</p>

      {post.location && <p className="text-sm">📍 {post.location}</p>}
      {post.budget && <p className="text-sm">💰 ₹{post.budget}</p>}

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
