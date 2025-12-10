// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealEstateCRM",
  description: "Real estate CRM and collaboration platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {/* TOP NAVBAR - visible on all pages */}
        <header className="border-b border-gray-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#c89a3b]" />
              <span className="font-semibold text-sm">
                Real<span className="text-[#c89a3b]">Estate</span>CRM
              </span>
            </div>

            {/* Center nav links */}
      <nav className="flex items-center gap-8 text-sm">
  <Link
    href="/"
    className="hover:text-[#c89a3b] transition"
  >
    Home
  </Link>

  {/* NEW DASHBOARD LINK */}
  <Link
    href="/dashboard"
    className="hover:text-[#c89a3b] transition"
  >
    Dashboard
  </Link>

  <Link
    href="/agents"
    className="hover:text-[#c89a3b] transition"
  >
    Agents
  </Link>

  <Link
    href="/contact"
    className="hover:text-[#c89a3b] transition"
  >
    Contact
  </Link>
</nav>


            {/* Right side buttons (static for now) */}
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full border border-gray-300 hover:bg-gray-50 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-full bg-[#c89a3b] text-white font-medium hover:bg-[#b4882f] transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        {children}
      </body>
    </html>
  );
}
