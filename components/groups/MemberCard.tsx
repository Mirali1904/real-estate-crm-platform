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
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-800">{member.name}</h4>
          <p className="text-sm text-gray-500">{member.email}</p>
          <p className="text-xs text-gray-400 mt-1">{member.user_role}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded ${
            member.role === "ADMIN"
              ? "bg-amber-100 text-amber-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {member.role}
        </span>
      </div>
      {isAdmin && member.user_id !== currentUserId && (
        <button
          onClick={() => onRemove(member.user_id)}
          className="mt-3 text-sm text-red-600 hover:text-red-700"
        >
          Remove
        </button>
      )}
    </div>
  );
}