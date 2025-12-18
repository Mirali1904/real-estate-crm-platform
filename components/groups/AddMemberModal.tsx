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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Add Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-80 overflow-y-auto space-y-3">
          {!agents || agents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No available admins to add
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium text-gray-800">
                    {agent.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {agent.email}
                  </div>
                </div>

                <button
                  onClick={() => onAddMember(agent.id)}
                  className="bg-[#c99a2e] hover:bg-[#b88923] text-white px-4 py-1 rounded text-sm font-medium"
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
