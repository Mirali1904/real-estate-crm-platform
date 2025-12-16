// app/(auth)/layout.tsx
import Header from "@/components/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* HEADER */}
      <Header />

      {/* PAGE CONTENT */}
      <main className="p-6 bg-gray-50 min-h-screen">
        {children}
      </main>
    </>
  );
}
