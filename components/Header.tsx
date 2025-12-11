// components/Header.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("logout error", e);
    }
    router.push("/login");
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 md:px-6">
        {/* LEFT: logo + nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#c89a3b]" />
            <span className="font-semibold text-gray-800">
              RealEstate<span className="text-[#c89a3b]">CRM</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-black">Home</Link>
            <Link href="/agents" className="hover:text-black">Agents</Link>
            <Link href="/contact" className="hover:text-black">Contact</Link>
          </nav>
        </div>

        {/* RIGHT: email + avatar + logout */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end text-sm text-gray-600">
            <span className="select-text">mirali123@gmail.com</span>
            <span className="text-xs text-gray-400">ADMIN</span>
          </div>

          <div
            className="w-9 h-9 rounded-full bg-[#c89a3b] flex items-center justify-center text-white font-medium"
            title="Profile"
          >
            M
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
