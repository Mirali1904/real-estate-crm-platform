"use client";

import { useState } from "react";

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
  // 🔍 SEARCH STATE (UNCHANGED)
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  // ✅ SAME LOGIC
  const filteredAgents = agents.filter((agent) => {
    const q = search.toLowerCase();
    return (
      agent.name.toLowerCase().includes(q) ||
      agent.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Add <span className="text-blue-900">Agency</span>
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* SEARCH BAR — SAME STYLE AS USERS / BUYERS */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-900"
          />
        </div>

        {/* LIST */}
        <div className="max-h-80 overflow-y-auto space-y-3">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500">
              No users found
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  {/* AVATAR */}
                  <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-sm font-semibold uppercase">
                    {agent.name.charAt(0)}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {agent.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {agent.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onAddMember(agent.id)}
                  className="px-4 py-1.5 rounded-full bg-blue-900 text-white text-xs font-medium hover:bg-indigo-700 transition"
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
