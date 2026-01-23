"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Home,
  UserCheck,
  CalendarDays,
  Bell,
UsersRound,

  LogOut,
} from "lucide-react";

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
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/buyers", label: "Buyers", icon: Users },
    { path: "/sellers", label: "Sellers", icon: Home },
    { path: "/groups", label: "Groups", icon: UserCheck },
    { path: "/appointments", label: "Appointments", icon: CalendarDays },
    {
      path: "/follow-ups",
      label: "Follow-ups",
      icon: Bell,
      badge: pendingCount,
    },
    { path: "/users", label: "Team", icon: UsersRound },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-white border-r border-gray-200 flex flex-col">


      {/* LOGO */}
<div className="h-18 flex items-center gap-3 px-4 border-b border-gray-200">
  <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
    <svg
      className="w-6 h-6"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  </div>

  <div className="leading-tight">
   <div className="text-gray-900 font-bold text-xl tracking-wide">
  RealEstate
</div>

    
  </div>
</div>



      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-1">

        {menu.map((item) => {
          const active = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                group flex items-center gap-3 px-4 py-2.5 rounded-lg
                text-sm font-medium transition-all
                ${
                  active
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 ${
                  active ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                }`}
              />
              <span className="flex-1">{item.label}</span>

              {item.badge ? (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                     text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
