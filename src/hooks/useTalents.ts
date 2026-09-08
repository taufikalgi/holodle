"use client";

import { useEffect, useState } from "react";
import { loadTalents, type Talent } from "@/lib/talents";

/** Loads the shared talent pool once; concurrent mounts share one request. */
export function useTalents() {
  const [talents, setTalents] = useState<Talent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    loadTalents().then(
      (pool) => {
        if (!alive) return;
        setTalents(pool);
        setLoading(false);
      },
      (e) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load talents");
        setLoading(false);
      }
    );
    return () => {
      alive = false;
    };
  }, []);

  return { talents, loading, error };
}
