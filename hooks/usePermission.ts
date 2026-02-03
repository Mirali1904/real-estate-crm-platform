import { useState, useEffect } from "react";

export function usePermission(permissionName: string) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      setLoading(true);

      try {
        const userStr = localStorage.getItem("loggedUser");
        if (!userStr) {
          setHasPermission(false);
          return;
        }

        const user = JSON.parse(userStr);

        const res = await fetch("/api/users/check-permission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            permissionName,
          }),
        });

        const data = await res.json();
        setHasPermission(Boolean(data.hasPermission));
      } catch {
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [permissionName]); // 👈 permission based re-run

  return { hasPermission, loading };
}
