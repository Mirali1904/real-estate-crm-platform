import "./globals.css";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-gray-50">
        <div className="flex h-full">
          {/* LEFT SIDEBAR */}
          <aside className="w-64 bg-white border-r flex-shrink-0">
            <Sidebar />
          </aside>

          {/* RIGHT CONTENT */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
