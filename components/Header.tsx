"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [openMore, setOpenMore] = useState(false);



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
    <header className="h-16 bg-indigo-600 border-b border-indigo-700 sticky top-0 z-40">
      <div className="h-full flex items-center justify-between px-6">
        {/* LEFT — MENU & SEARCH */}
        <div className="flex items-center gap-4">
         <button
  onClick={() => {
    setShowMenu(!showMenu);
    console.log("Sidebar toggle clicked");
  }}
  className="text-white hover:bg-indigo-700 p-2 rounded-lg transition"
>

            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search"
              className="bg-indigo-700/50 text-white placeholder-indigo-300 px-4 py-2 pl-10 rounded-lg text-sm focus:outline-none focus:bg-indigo-700 transition w-64"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* RIGHT — ACTIONS & USER */}
        <div className="flex items-center gap-3">
          {/* PRINT BUTTON */}
          <button
  onClick={() => window.print()}
  className="hidden md:flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm transition"
>

            <span>🖨️</span>
            <span>PRINT</span>
          </button>

          {/* GET INFO BUTTON */}
         <button
  onClick={() => alert("RealestateCRM v1.0\nInternal Admin Dashboard")}
  className="hidden md:flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm transition"
>

            <span>ℹ️</span>
            <span>GET INFO</span>
          </button>

          {/* NOTIFICATION */}
         <button
  onClick={() => router.push("/follow-ups")}
  className="relative text-white hover:bg-indigo-700 p-2 rounded-lg transition"
>

            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* MORE OPTIONS */}
         <div className="relative">
  {/* MORE ICON BUTTON */}
  <button
    onClick={() => setOpenMore(!openMore)}
    className="text-white hover:bg-indigo-700 p-2 rounded-lg transition"
  >
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 5v.01M12 12v.01M12 19v.01"
      />
    </svg>
  </button>

  {/* DROPDOWN */}
  {openMore && (
    <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg w-40 border text-sm z-50">
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
      >
        Logout
      </button>
    </div>
  )}
</div>

        </div>
      </div>
    </header>
  );
}