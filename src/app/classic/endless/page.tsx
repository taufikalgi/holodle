"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ALL_BRANCHES } from "@/lib/talents";
import { useTalents } from "@/hooks/useTalents";
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
  const { talents, loading: talentsLoading, error: talentsError } = useTalents();

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only hydration from URL/localStorage must stay in an effect (SSR has no localStorage)
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

  if (talentsLoading || !talents) {
    return (
      <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
        <Navbar title="ENDLESS" />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
            Loading talents…
          </p>
        </div>
      </main>
    );
  }

  if (talentsError || talents.length === 0) {
    return (
      <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
        <Navbar title="ENDLESS" />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
            {talentsError || "Failed to load talents."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
            style={{ background: "var(--holo-blue)" }}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <EndlessGameContent
      key={storageKey}
      storageKey={storageKey}
      talents={talents}
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
