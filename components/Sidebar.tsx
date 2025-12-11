// components/Sidebar.tsx
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
    <div className="h-full flex flex-col">
      <div className="bg-white h-full w-full rounded-none box-border">
        <div className="h-full flex flex-col justify-between p-6">
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

            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Menu</h3>

            <nav className="flex flex-col gap-2">
              <Link href="/users/new" className={itemClass("/users/new")}>Add User / Agent</Link>
              <Link href="/users" className={itemClass("/users")}>Users / Team</Link>
              <Link href="/buyers" className={itemClass("/buyers")}>Buyers</Link>
              <Link href="/sellers" className={itemClass("/sellers")}>Sellers / Properties</Link>
              <Link href="/leads" className={itemClass("/leads")}>Leads</Link>
              <Link href="/groups" className={itemClass("/groups")}>Groups</Link>
            </nav>
          </div>

          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="w-full text-sm rounded-md py-2 bg-white border border-gray-200 hover:bg-gray-50"
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
