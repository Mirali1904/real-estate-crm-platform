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
    <header className="h-16 bg-white border-b border-gray-200">
    <div className="h-full flex items-center justify-between px-6">

        
        {/* LEFT — LOGO ONLY */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#c89a3b]" />
          <span className="font-semibold text-gray-800">
            RealEstate<span className="text-[#c89a3b]">CRM</span>
          </span>
        </div>

        {/* RIGHT — USER + LOGOUT */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end text-sm text-gray-600">
            <span>{user?.email || ""}</span>
            <span className="text-xs text-gray-400">ADMIN</span>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#c89a3b] flex items-center justify-center text-white font-medium">
            {user?.email?.[0]?.toUpperCase() || ""}
          </div>

          <button
            onClick={handleLogout}
            className="text-sm border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
