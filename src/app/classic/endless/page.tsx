"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ALL_BRANCHES } from "@/lib/talents";
import { BranchFilterModal, Navbar } from "@/components/ui";
import { EndlessGameContent } from "@/components/classic/EndlessGameContent";

const LAST_BRANCHES_KEY = "holodle-endless-last-branches";

function getEndlessStorageKey(branches: string[] | null): string {
  if (!branches || branches.length === 0 || branches.length === ALL_BRANCHES.length) {
    return "holodle-endless-stats";
  }
  return `holodle-endless-stats-${branches.join("-")}`;
}

function EndlessGamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBranchParam = searchParams.get("branches");

  const [hydrated, setHydrated] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[] | null>(null);
  const [showFilter, setShowFilter] = useState(true);

  useEffect(() => {
    let branches: string[] | null = null;
    if (initialBranchParam) {
      branches = initialBranchParam.split(",");
    } else {
      try {
        const last = localStorage.getItem(LAST_BRANCHES_KEY);
        if (last) branches = JSON.parse(last);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe hydration: reads URL/localStorage once on mount
    setSelectedBranches(branches);
    setShowFilter(!branches);
    setHydrated(true);
  }, []);

  function handleBranchSelect(branches: string[]) {
    localStorage.setItem(LAST_BRANCHES_KEY, JSON.stringify(branches));
    setSelectedBranches(branches);
    router.replace(`/classic/endless?branches=${branches.join(",")}`);
    setShowFilter(false);
  }

  if (!hydrated) {
    // Keep inline: transient hydration shell — GameShell would add an empty
    // container div + footer around bare Navbar output.
    return (
      <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
        <Navbar title="ENDLESS" />
      </main>
    );
  }

  if (showFilter) {
    return (
      <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
        <Navbar title="ENDLESS" />
        <BranchFilterModal
          initialBranches={selectedBranches ?? undefined}
          onStart={handleBranchSelect}
          onClose={() => setShowFilter(false)}
        />
      </main>
    );
  }

  const storageKey = getEndlessStorageKey(selectedBranches);

  return (
    <EndlessGameContent
      key={storageKey}
      storageKey={storageKey}
      selectedBranches={selectedBranches}
      onChangeBranches={() => setShowFilter(true)}
    />
  );
}

export default function EndlessGame() {
  return (
    <Suspense fallback={null}>
      <EndlessGamePage />
    </Suspense>
  );
}
