interface GroupCardProps {
  group: {
    id: number;
    name: string;
    description: string;
    creator_name: string;
    member_count: number;
    user_role?: string;
  };
  onClick: () => void;
}

export default function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6 border border-gray-200"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {group.name}
        </h3>
        {group.user_role === "ADMIN" && (
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
            Admin
          </span>
        )}
      </div>

      <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[40px]">
        {group.description || "No description provided"}
      </p>

      <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>{group.member_count} members</span>
        </div>
        <div>by {group.creator_name}</div>
      </div>
    </div>
  );
}