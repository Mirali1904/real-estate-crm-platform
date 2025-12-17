// app/groups/layout.tsx
import AppLayout from "../(app)/layout";

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
