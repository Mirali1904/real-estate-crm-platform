"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";


export default function Header() {
  const router = useRouter();
  const pathname = usePathname() || "";



   const isBuyerDetailPage =
    pathname.startsWith("/buyers/") && pathname.split("/").length === 3;

    const isSellerDetailPage =
  pathname.startsWith("/sellers/") && pathname.split("/").length === 3;

  const isTeamAddPage = pathname === "/users/new";

  const isGroupDetailPage =
  pathname.startsWith("/groups/") && pathname.split("/").length === 3;





  const [user, setUser] = useState<any>(null);
  const [openMore, setOpenMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("loggedUser");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    localStorage.removeItem("loggedUser");
    router.push("/login");
  }

  const getPageTitle = () => {
  if (pathname.startsWith("/buyers")) return "Buyer Leads";
  if (pathname.startsWith("/sellers")) return "Seller Leads";
  if (pathname.startsWith("/properties")) return "Properties";
  if (pathname.startsWith("/groups")) return "Groups";
  if (pathname.startsWith("/appointments")) return "Appointments";
  if (pathname.startsWith("/profile")) return "Profile";

  if (pathname.startsWith("/follow-ups")) return "Follow Ups";
  if (pathname.startsWith("/users")) return "Team";
  return "Dashboard";
};


  return (
    
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm"
    
    >
      <div className="h-full flex items-center justify-between px-6">

        <div className="flex items-center gap-3">
  {(isBuyerDetailPage ||
  isSellerDetailPage ||
  isTeamAddPage ||
  isGroupDetailPage) && (

  <button
    onClick={() => {
  if (isBuyerDetailPage) router.push("/buyers");
  else if (isSellerDetailPage) router.push("/sellers");
  else if (isGroupDetailPage) router.push("/groups");
  else router.push("/users");
}}

    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition"
    aria-label="Back"
  >
    ←
  </button>
)}



  <h1 className="text-xl font-bold text-gray-900">
    {getPageTitle()}
  </h1>
</div>
        


        {/* RIGHT — SEARCH + ACTIONS */}
        <div className="flex items-center gap-4">

          

          {/* NOTIFICATION BELL */}
          <button
            onClick={() => router.push("/follow-ups")}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
            aria-label="Notifications"
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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* USER DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setOpenMore(!openMore)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                {user?.name?.[0]?.toUpperCase() || "M"}
              </div>
            </button>

            {openMore && (
              <>
                {/* BACKDROP */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenMore(false)}
                />
                
                {/* DROPDOWN MENU */}
                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-lg w-56 z-20">
                  {/* USER INFO */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                        {user?.name?.[0]?.toUpperCase() || "M"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MENU ITEMS */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setOpenMore(false);
                        router.push("/profile");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        setOpenMore(false);
                        router.push("/settings");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>
                  </div>

                  {/* LOGOUT */}
                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={() => {
                        setOpenMore(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}