"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const [pendingCount, setPendingCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname() || "";

  async function handleLogout() {
    localStorage.removeItem("loggedUser");
    router.push("/login");
  }

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const u = JSON.parse(raw);
    setUser(u);

    fetch(
      `/api/follow-ups/pending-count?agentId=${u.id}&tenantId=${u.tenantId}`
    )
      .then((r) => r.json())
      .then((d) => setPendingCount(d.count ?? 0));
  }, []);

  const menu = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/buyers", label: "Buyers", icon: "👥" },
    { path: "/sellers", label: "Sellers", icon: "🏠" },
    
    { path: "/groups", label: "Groups", icon: "👨‍👩‍👧‍👦" },
    { path: "/appointments", label: "Appointments", icon: "📅" },
    { path: "/follow-ups", label: "Follow-ups", icon: "🔔", badge: pendingCount },
    { path: "/users", label: "Team", icon: "👨‍💼" },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-white border-r border-gray-200 flex flex-col shadow-sm">

      {/* LOGO */}
     <div className="h-14 flex items-center gap-3 px-4 border-b border-gray-200">

        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </div>
        <span className="text-gray-900 font-bold text-xl">
          RealEstate
        </span>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">

        {menu.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5
rounded-xl text-sm font-medium transition-all
                ${
                  active
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold min-w-[20px] text-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER - SETTINGS & LOGOUT */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}