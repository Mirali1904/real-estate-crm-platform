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

  const itemClass = (path: string) =>
    `block text-sm text-gray-700 rounded-md px-4 py-2 transition ${
      pathname === path ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
    }`;

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r z-50">
      <div className="h-full flex flex-col p-6">

        {/* TOP */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-md bg-[#c89a3b]" />
            <div>
              <div className="font-semibold text-gray-800">
                RealEstate<span className="text-[#c89a3b]">CRM</span>
              </div>
              <div className="text-xs text-gray-400">Admin</div>
            </div>
          </div>

          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">
            Menu
          </h3>

          <nav className="flex flex-col gap-2">
            <Link href="/buyers" className={itemClass("/buyers")}>
              Buyers
            </Link>

            <Link href="/sellers" className={itemClass("/sellers")}>
              Sellers / Properties
            </Link>

            <Link href="/groups" className={itemClass("/groups")}>
              Groups
            </Link>

            <Link href="/users" className={itemClass("/users")}>
              Users / Team
            </Link>
          </nav>
        </div>

        {/* LOGOUT — ALWAYS BOTTOM */}
        <div className="mt-auto pt-4">
          <button
            onClick={handleLogout}
            className="w-full text-sm rounded-md py-2 bg-white border border-gray-200 hover:bg-gray-50"
            type="button"
          >
            Logout
          </button>
        </div>

      </div>
    </aside>
  );
}
  