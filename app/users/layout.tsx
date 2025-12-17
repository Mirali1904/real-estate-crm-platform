// app/users/layout.tsx
import AppLayout from "../(app)/layout";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
