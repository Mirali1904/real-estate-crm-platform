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
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("logout error", e);
    }
    router.push("/login");
  }

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;

    const user = JSON.parse(raw);
    setUser(user);

    fetch(
      `/api/follow-ups/pending-count?agentId=${user.id}&tenantId=${
        user.tenant_id ?? user.tenantId
      }`
    )
      .then((res) => res.json())
      .then((data) => {
        setPendingCount(data.count ?? 0);
      })
      .catch(() => {});
  }, []);

  const menuItems = [
    { path: "/dashboard", icon: "🏠", label: "Dashboard" },
    { path: "/buyers", icon: "🧍", label: "Buyers" },
    { path: "/sellers", icon: "🏘️", label: "Sellers" },
    { path: "/follow-ups", icon: "🔔", label: "Follow-ups", badge: pendingCount },
    { path: "/groups", icon: "👥", label: "Groups" },
    { path: "/users", icon: "⚙️", label: "Users" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="fixed top-0 left-0 h-screen w-52 bg-white border-r border-gray-200 z-50 flex flex-col">
      {/* LOGO */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-indigo-600">
        <span className="text-white text-xl font-bold tracking-tight">
         RealestateCRM
        </span>
      </div>

      {/* USER PROFILE */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || "User"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user?.email || "user@email.com"}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600 transition"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                ${
                  isActive(item.path)
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* EXTRA PAGES SECTION */}
        <div className="mt-6 px-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Extra Pages
          </div>
          <div className="space-y-1">
            <Link
              href="/appointments"
              className={`
                flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition
                ${
                  isActive("/appointments")
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <span>📅</span>
              <span className="font-medium">Appointments</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* FOOTER */}
      {/* FOOTER */}
<div className="p-4 border-t border-gray-200 space-y-3">
  {/* LOGOUT BUTTON */}
  <button
    onClick={handleLogout}
    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 py-2 rounded-lg transition"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
      />
    </svg>
    Logout
  </button>

 
</div>

    </aside>
  );
}