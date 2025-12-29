interface Member {
  id: number;        // group_members.id
  user_id: number;   // users.id
  name: string;
  email: string;
}

interface AgencyCardProps {
  agency: Member;
  isCreator: boolean;
  onRemove: () => void;
}

export default function AgencyCard({
  agency,
  isCreator,
  onRemove,
}: AgencyCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        {/* INFO */}
        <div>
          <h4 className="font-semibold text-gray-800 leading-tight">
            {agency.name}
          </h4>
          <p className="text-sm text-gray-500">
            {agency.email}
          </p>
        </div>

        {/* ACTION */}
        {isCreator && (
          <button
            onClick={onRemove}
            className="text-sm text-red-600 hover:text-red-700 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
