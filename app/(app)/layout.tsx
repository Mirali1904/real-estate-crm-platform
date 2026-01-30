"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("loggedUser");
    if (!user) router.replace("/login");
  }, [router]);

 return (
  <div className="min-h-screen bg-gray-50 flex">
    {/* SIDEBAR */}
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

    {/* RIGHT SIDE */}
    <div className="flex-1 md:ml-56 flex flex-col">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white">
        <Header onMenuClick={() => setSidebarOpen(true)} />
      </div>

      {/* CONTENT */}
      <main className="px-2 md:px-3 py-3">

        {children}
      </main>
    </div>
  </div>
);
}