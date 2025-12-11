// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // <<--- IMPORTANT: keep this so Tailwind/styles load

export const metadata: Metadata = {
  title: "RealEstateCRM",
  description: "Real estate CRM and collaboration platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
