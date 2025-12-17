import AppLayout from "../(app)/layout";

export default function SellersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
