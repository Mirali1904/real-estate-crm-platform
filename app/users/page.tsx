"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, MoreHorizontal, Shield, CheckCircle, Plus, Search } from "lucide-react";

type LoggedUser = {
  id: number;
  tenantId?: number;
  tenant_id?: number;
  name: string;
  email: string;
  role: string;
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;

  properties_count: number;
  sales_amount: number;
};


export default function UsersPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) {
      router.replace("/login");
      return;
    }

    const parsed = JSON.parse(raw) as LoggedUser;
    const tenantId = parsed.tenantId ?? parsed.tenant_id;

    if (!tenantId) {
      router.replace("/login");
      return;
    }

    setCurrentUser({ ...parsed, tenantId });

    fetch(`/api/users/${tenantId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.users || []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "AGENT":
        return "bg-blue-100 text-blue-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="w-full px-6 lg:px-10 xl:px-14 space-y-6">

        <div className="flex items-center gap-3 w-full">
  {/* SEARCH BAR - FULL WIDTH */}
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search by name, email or phone..."
      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
    />
  </div>

  {/* INVITE MEMBER BUTTON */}
  <Link href="/users/new">
    <button className="bg-blue-900 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-900 transition font-medium whitespace-nowrap">
      <Plus className="w-4 h-4" />
      Invite Member
    </button>
  </Link>
</div>


        {/* Loading State */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading team members...</p>
        ) : (
          <>
            {/* Team Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

              {filteredUsers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all group"
                >
                  {/* Header with Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-semibold">
  {member.name[0].toUpperCase()}
</div>

                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{member.name}</h3>
                        <span className={`${getRoleColor(member.role)} border-0 rounded-full text-xs px-2.5 py-1 inline-block mt-1 font-medium`}>
                          {member.role.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg">
                      <MoreHorizontal className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">N/A</span>
                    </div>
                  </div>

                  {/* Status & Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status</span>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">ACTIVE</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Joined</span>
                      <span className="text-xs font-medium text-gray-900">
                        {new Date(member.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Properties</p>
                     <p className="font-bold text-lg text-gray-900">
  {member.properties_count ?? 0}
</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Sales</p>
                      <p className="font-bold text-lg text-blue-900">
  ₹{member.sales_amount ?? 0}
</p>
                    </div>
                  </div>

                  {/* Permission Badge */}
                  <button className="w-full border border-gray-200 bg-transparent rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    Manage Permissions
                  </button>
                </div>
              ))}

              {/* Add New Member CTA */}
              <Link href="/users/new">
                <div className="bg-white p-6 rounded-xl border-dashed border-2 border-gray-300 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-900 transition-colors group h-full min-h-[400px]">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-900 transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-900 transition-colors">
                    Invite Member
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">Add a new team member to your organization</p>
                  <button className="bg-blue-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-900 transition">
                    Send Invite
                  </button>
                </div>
              </Link>
            </div>

            {/* No Results */}
            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No team members found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}