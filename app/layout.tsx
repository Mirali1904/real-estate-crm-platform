// app/layout.tsx
import "./globals.css";
import SocketWrapper from "@/components/SocketWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <SocketWrapper>
          {children}
        </SocketWrapper>
      </body>
    </html>
  );
}
