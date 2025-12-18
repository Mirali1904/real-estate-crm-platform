interface Agency {
  id: number;
  agency_id: number;
  name: string;
  email: string;
}

interface AgencyCardProps {
  agency: Agency;
  isCreator: boolean;
  onRemove: () => void;
}

export default function AgencyCard({
  agency,
  isCreator,
  onRemove,
}: AgencyCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-800">{agency.name}</h4>
          <p className="text-sm text-gray-500">{agency.email}</p>
        </div>

        {isCreator && (
          <button
            onClick={onRemove}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
