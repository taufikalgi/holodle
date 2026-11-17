"use client";

import { useEffect, useState } from "react";
import { loadTalents, type Talent } from "@/lib/talents";
import { fetchAvatarTalents, getAvatarTalentPool } from "@/lib/avatar-api";

export function useAvatarTalentPool() {
  const [validTalents, setValidTalents] = useState<Talent[]>([]);
  const [poolStatus, setPoolStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [poolError, setPoolError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const [talents, avatarTalents] = await Promise.all([
          loadTalents(),
          fetchAvatarTalents(),
        ]);
        if (!alive) return;

        setValidTalents(getAvatarTalentPool(avatarTalents, talents));
        setPoolStatus("ready");
      } catch {
        if (!alive) return;
        setValidTalents([]);
        setPoolError("Failed to load avatar talents");
        setPoolStatus("error");
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, [attempt]);

  const retry = () => {
    setValidTalents([]);
    setPoolError("");
    setPoolStatus("loading");
    setAttempt((value) => value + 1);
  };

  return { validTalents, poolStatus, poolError, retry };
}
