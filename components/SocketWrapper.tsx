// "use client";

// import { useEffect, useState } from "react";
// import { SocketProvider } from "@/lib/socket-context";

// export default function SocketWrapper({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [userId, setUserId] = useState<number | undefined>(undefined);

//   useEffect(() => {
//     const raw = localStorage.getItem("loggedUser");
//     if (raw) {
//       const user = JSON.parse(raw);
//       setUserId(user.id);
//     }
//   }, []);

//   if (!userId) return <>{children}</>;

//   return (
//     <SocketProvider userId={userId}>
//       {children}
//     </SocketProvider>
//   );
// }
