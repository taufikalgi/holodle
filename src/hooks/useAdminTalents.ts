"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, getToken } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { Talent } from "@/lib/talent-api";
import { compareTalentsByKey } from "@/components/admin";
import type { SortKey, SortDirection } from "@/components/admin";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1`;

export function useAdminTalents() {
  const { user, loading: authLoading, logout } = useAuth({ requireAdmin: true });
  const router = useRouter();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [archetypeFilter, setArchetypeFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; talent?: Talent } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTalents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/talent/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setTalents(data.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch talents");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/admin/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user) fetchTalents();
  }, [authLoading, user, fetchTalents]);

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  const archetypes = useMemo(
    () => [...new Set(talents.map((t) => t.lore_archetype).filter(Boolean))].sort(),
    [talents]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const results = talents.filter(
      (t) =>
        (!q ||
          t.name.toLowerCase().includes(q) ||
          t.alt_names.some((a: string) => a.toLowerCase().includes(q))) &&
        (!branchFilter || t.branch === branchFilter) &&
        (!archetypeFilter || t.lore_archetype === archetypeFilter)
    );

    if (!sortKey) return results;

    return [...results].sort((a, b) => {
      const diff = compareTalentsByKey(a, b, sortKey);
      return sortDirection === "asc" ? diff : -diff;
    });
  }, [talents, search, branchFilter, archetypeFilter, sortKey, sortDirection]);

  const branches = useMemo(() => [...new Set(talents.map((t) => t.branch))].sort(), [talents]);

  const onSaved = () => {
    fetchTalents();
    showToast(modal?.mode === "create" ? "Talent created! 🎨" : "Talent updated! ✨");
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
      return;
    }

    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }

    setSortKey(null);
  };

  return {
    user,
    authLoading,
    talents,
    loading,
    error,
    search,
    setSearch,
    branchFilter,
    setBranchFilter,
    archetypeFilter,
    setArchetypeFilter,
    sortKey,
    sortDirection,
    toggleSort,
    modal,
    setModal,
    toast,
    showToast,
    branches,
    archetypes,
    filtered,
    fetchTalents,
    handleLogout,
    onSaved,
  };
}
