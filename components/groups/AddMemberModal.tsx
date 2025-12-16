interface Agent {
  id: number;
  name: string;
  email: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onAddMember: (agentId: number) => void;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  agents,
  onAddMember,
}: AddMemberModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {agents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available agents to add
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium text-gray-800">{agent.name}</div>
                  <div className="text-sm text-gray-500">{agent.email}</div>
                </div>
                <button
                  onClick={() => onAddMember(agent.id)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}