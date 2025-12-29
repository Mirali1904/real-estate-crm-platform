"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    setUser(user);

    Promise.all([
      fetch(`/api/buyers/tenant/${user.tenantId}`).then((r) => r.json()),
      fetch(`/api/sellers/tenant/${user.tenantId}`).then((r) => r.json()),
      fetch("/api/groups/accessible", {
        headers: { "x-tenant-id": String(user.tenantId) },
      })
        .then((r) => r.json())
        .catch(() => ({ groups: [] })),
    ])
      .then(([buyersRes, sellersRes, groupsRes]) => {
        setBuyers(Array.isArray(buyersRes) ? buyersRes : []);

        if (sellersRes?.success) {
          setProperties(sellersRes.sellers || []);
        } else if (Array.isArray(sellersRes)) {
          setProperties(sellersRes);
        } else {
          setProperties([]);
        }

        setGroups(Array.isArray(groupsRes?.groups) ? groupsRes.groups : []);
        setLoading(false);
      })
      .catch(() => {
        setBuyers([]);
        setProperties([]);
        setGroups([]);
        setLoading(false);
      });
  }, []);

  if (!user || loading) return null;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Stat
          label="Customers"
          value={buyers.length}
          onClick={() => router.push("/buyers")}
        />
        <Stat
          label="Properties"
          value={properties.length}
          onClick={() => router.push("/sellers")}
        />
        <Stat
          label="Groups"
          value={groups.length}
          onClick={() => router.push("/groups")}
        />

        {/* CUSTOMERS MINI LIST */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Customers</h3>
            <span
              className="text-sm text-indigo-600 cursor-pointer"
              onClick={() => router.push("/buyers")}
            >
              View All
            </span>
          </div>

          <div className="space-y-4">
            {buyers.slice(0, 2).map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                  {b.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="text-xs text-gray-500">{b.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* APPOINTMENT + RECENT BUYERS */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 bg-indigo-600 text-white rounded-2xl p-6">
          <div className="text-sm opacity-80 mb-2">Next Appointment</div>
          <div className="text-sm opacity-90">No upcoming appointments</div>
        </div>

        <div className="xl:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Recent Buyers</h3>
            <span
              className="text-sm text-indigo-600 cursor-pointer"
              onClick={() => router.push("/buyers")}
            >
              View All
            </span>
          </div>

          <div className="space-y-4">
            {buyers.slice(0, 2).map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                  {b.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-sm text-gray-500">{b.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROPERTIES + TASKS */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-4 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Recent Properties</h3>
            <span
              className="text-sm text-indigo-600 cursor-pointer"
              onClick={() => router.push("/sellers")}
            >
              View All
            </span>
          </div>

          {properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.slice(0, 4).map((p) => (
                <div key={p.id} className="border rounded-xl p-4">
                  <div className="font-medium">{p.property_type}</div>
                  <div className="text-sm text-gray-500">{p.location}</div>
                  <div className="mt-2 font-semibold">₹{p.price}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Tasks To Do</h3>
            <span className="text-sm text-indigo-600 cursor-pointer">
              View All
            </span>
          </div>
          <div className="text-sm text-gray-400">No tasks for today</div>
        </div>
      </div>
    </div>
  );
}

/* STAT CARD */
function Stat({ label, value, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition"
    >
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}
