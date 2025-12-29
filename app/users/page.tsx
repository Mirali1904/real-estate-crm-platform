"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/BackButton";

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

  /* 🔍 SEARCH FILTER (buyer jaisa) */
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  if (!currentUser) return null;

  return (
    <div className="w-full px-6 pt-2 space-y-6">

      {/* BACK */}
      <BackButton />

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Team Members</h1>
          <p className="text-xs text-gray-500">
            Users in your agency (tenant_id {currentUser.tenantId})
          </p>
        </div>

        <Link href="/users/new">
  <button
    className="
      bg-indigo-600
      text-white
      px-5
      py-2.5
      rounded-full
      text-sm
      font-medium
      hover:bg-indigo-700
      transition
    "
  >
    + Add User
  </button>
</Link>

      </div>

      {/* SEARCH BAR (buyer jaisa) */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email or role"
        className="w-full max-w-md border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
      />

      {/* LIST */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-sm text-gray-500">No users found</p>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center"
            >
              <div className="flex gap-4 items-center">
                {/* AVATAR */}
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                  {u.name[0].toUpperCase()}
                </div>

                <div>
                  <p className="font-medium text-sm">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  {u.role}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(u.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
