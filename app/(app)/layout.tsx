// app/(app)/layout.tsx
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* fixed header */}
      <Header />

      <div className="flex">
        {/* Fixed aside: left column that spans from header-bottom to bottom */}
        <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-72 p-0 z-30">
          <Sidebar />
        </aside>

        {/* Main content: add left padding equal to sidebar width on md+ so content doesn't hide behind aside */}
        <main className="flex-1 min-h-screen pt-20 px-6 md:pl-[18rem] md:pr-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
