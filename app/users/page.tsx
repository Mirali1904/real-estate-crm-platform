"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
};

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("loggedUser")
        : null;

    if (!raw) {
      router.replace("/login");
      return;
    }

    try {
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
          if (data.success) {
            setUsers(data.users || []);
          }
        })
        .finally(() => setLoading(false));
    } catch (err) {
      console.error(err);
      router.replace("/login");
    }
  }, [router]);

  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f5f5f5]">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Team Members</h1>
            <p className="text-xs text-gray-500 mt-1">
              Users in your agency (tenant_id{" "}
              {currentUser.tenantId ?? currentUser.tenant_id})
            </p>
          </div>

          <Link href="/users/new">
            <button className="bg-[#c89a3b] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#b4882f] transition">
              + Add User
            </button>
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-500">
            No users yet. Use &quot;Add User&quot; to invite your team.
          </p>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-[0.15em] text-gray-500">
                      {u.role}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
