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
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded mr-2">
            {post.post_type}
          </span>
          <h3 className="text-lg font-semibold text-gray-800 inline">
            {post.title}
          </h3>
        </div>
      </div>
      
      <p className="text-gray-600 mb-3">{post.description}</p>
      
      {post.location && (
        <p className="text-sm text-gray-500 mb-1">📍 {post.location}</p>
      )}
      
      {post.budget && (
        <p className="text-sm text-gray-500 mb-1">
          💰 Budget: ₹{post.budget.toLocaleString()}
        </p>
      )}
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t text-sm text-gray-500">
        <span>Posted by {post.author_name}</span>
        <span>{post.response_count} responses</span>
      </div>
    </div>
  );
}