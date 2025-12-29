interface MemberCardProps {
  member: {
    id: number;
    user_id: number;
    name: string;
    email: string;
    role: string;
    user_role: string;
  };
  isAdmin: boolean;
  currentUserId: number;
  onRemove: (userId: number) => void;
}

export default function MemberCard({
  member,
  isAdmin,
  currentUserId,
  onRemove,
}: MemberCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
      {/* TOP */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-800 leading-tight">
            {member.name}
          </h4>
          <p className="text-sm text-gray-500">{member.email}</p>

          <p className="text-xs text-gray-400 mt-1">
            {member.user_role}
          </p>
        </div>

        {/* ROLE BADGE */}
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            member.role === "ADMIN"
              ? "bg-amber-100 text-amber-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {member.role}
        </span>
      </div>

      {/* ACTION */}
      {isAdmin && member.user_id !== currentUserId && (
        <div className="mt-4 text-right">
          <button
            onClick={() => onRemove(member.user_id)}
            className="text-sm text-red-600 hover:text-red-700 hover:underline"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
