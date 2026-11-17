"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function useAdminGuard() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/admin/login");
  }, [authLoading, user, router]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/admin/login");
  }, [logout, router]);

  return { user, authLoading, handleLogout };
}
