"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
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

  const iconClass = (path: string) =>
  `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
    pathname === path
      ? "bg-indigo-600 text-white"
      : "text-gray-600 hover:bg-gray-100"
  }`;


  return (
   <aside className="fixed top-0 left-0 h-screen w-56 bg-[#f8fafc] border-r border-slate-200 z-50">

      <div className="h-full flex flex-col items-center py-6">

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8 px-4">
  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
    R
  </div>
  <span className="font-semibold text-gray-700">RealEstateCRM</span>
</div>

        {/* NAV ICONS */}
        <nav className="flex flex-col gap-4 flex-1">

          {/* DASHBOARD */}
          <Link href="/dashboard" className={iconClass("/dashboard")}>
  <span className="text-lg">📊</span>
  <span className="text-sm font-medium">Dashboard</span>
</Link>


          {/* BUYERS */}
          <Link href="/buyers" className={iconClass("/buyers")}>
  <span className="text-lg">🧍</span>
  <span className="text-sm font-medium">Buyers</span>
</Link>


          {/* SELLERS / PROPERTIES */}
          <Link href="/sellers" className={iconClass("/sellers")}>
  <span className="text-lg">🏠</span>
  <span className="text-sm font-medium">Sellers</span>
</Link>


          {/* GROUPS */}
          <Link href="/groups" className={iconClass("/groups")}>
  <span className="text-lg">👥</span>
  <span className="text-sm font-medium">Groups</span>
</Link>


          {/* USERS */}
          <Link href="/users" className={iconClass("/users")}>
  <span className="text-lg">⚙️</span>
  <span className="text-sm font-medium">Users</span>
</Link>


        </nav>

        {/* LOGOUT */}
        <div className="pb-4">
          <button
            onClick={handleLogout}
            className="w-11 h-11 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"
            type="button"
            title="Logout"
          >
            ⏻
          </button>
        </div>

      </div>
    </aside>
  );
}
