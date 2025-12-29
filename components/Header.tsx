"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (raw) {
      setUser(JSON.parse(raw));
    }
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("logout error", e);
    }
    localStorage.removeItem("loggedUser");
    router.push("/login");
  }

  return (
    <header className="h-16 bg-[#f8fafc] border-b border-slate-200">
      <div className="h-full flex items-center justify-between px-6">

        {/* LEFT — LOGO */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm" />
          <span className="font-semibold text-slate-800 tracking-tight">
            RealEstate<span className="text-indigo-600">CRM</span>
          </span>
        </div>

        {/* RIGHT — USER */}
        <div className="flex items-center gap-4">

          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-sm text-slate-700">
              {user?.email || ""}
            </span>
            <span className="text-xs text-slate-400">
              ADMIN
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
            {user?.email?.[0]?.toUpperCase() || ""}
          </div>

          <button
            onClick={handleLogout}
            className="text-sm border border-slate-300 rounded-full px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition"
            type="button"
          >
            Logout
          </button>

        </div>
      </div>
    </header>
  );
}
