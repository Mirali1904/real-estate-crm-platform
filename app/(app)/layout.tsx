"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("loggedUser");
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* SIDEBAR — FIXED & THIN */}
      <Sidebar />

      {/* MAIN CONTENT — SHIFTED BY SIDEBAR WIDTH */}
      <div className="flex min-h-screen flex-col ml-56">

        {/* HEADER */}
        <Header />

        {/* PAGE CONTENT */}
     <main className="flex-1 pr-6 pt-4 pb-6 overflow-y-auto">





          {children}
        </main>

      </div>
    </div>
  );
}
