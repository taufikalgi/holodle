"use client";

import { Suspense, useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ALL_TALENTS,
  ALL_BRANCHES,
  compareTalents,
  filterTalentsByBranch,
  type Talent,
  type CompareResult,
} from "@/lib/talents";
import {
  BranchFilterModal,
  ColumnHeaders,
  DEFAULT_COLUMN_HEADERS,
  Footer,
  GameOverBanner,
  GuessRow,
  HowToPlay,
  Navbar,
  PageHeader,
  StatsBar,
  TalentSearchInput,
} from "@/components/ui";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useTalentSearch } from "@/hooks/useTalentSearch";

const MAX_GUESSES = 6;
const LAST_BRANCHES_KEY = "holodle-endless-last-branches";

interface EndlessState {
  current: {
    answer: Talent;
    guesses: { talent: Talent; result: CompareResult }[];
    gameOver: boolean;
    won: boolean;
  };
  stats: {
    streak: number;
    bestStreak: number;
    totalPlayed: number;
    totalWon: number;
  };
  recentTalents: string[];
}

function isValidEndlessState(data: unknown): data is EndlessState {
  if (typeof data !== "object" || data === null) return false;
  const c = data as Record<string, unknown>;
  const curr = c.current as Record<string, unknown> | undefined;
  const st = c.stats as Record<string, unknown> | undefined;
  return (
    typeof curr === "object" && curr !== null &&
    typeof curr.answer === "object" && curr.answer !== null &&
    Array.isArray(curr.guesses) &&
    typeof curr.gameOver === "boolean" &&
    typeof curr.won === "boolean" &&
    typeof st === "object" && st !== null &&
    typeof st.streak === "number" &&
    typeof st.bestStreak === "number" &&
    typeof st.totalPlayed === "number" &&
    typeof st.totalWon === "number" &&
    Array.isArray(c.recentTalents) &&
    c.recentTalents.every((t: unknown) => typeof t === "string")
  );
}

function getEndlessStorageKey(branches: string[] | null): string {
  if (!branches || branches.length === 0 || branches.length === ALL_BRANCHES.length) {
    return "holodle-endless-stats";
  }
  return `holodle-endless-stats-${branches.join("-")}`;
}

function getRandomTalent(pool: Talent[], excludeIds: string[] = []): Talent {
  const filtered = pool.filter((t) => !excludeIds.includes(t.id));
  const source = filtered.length > 0 ? filtered : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function getInitialState(pool: Talent[]): EndlessState {
  const answer = getRandomTalent(pool, []);
  return {
    current: { answer, guesses: [], gameOver: false, won: false },
    stats: { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0 },
    recentTalents: [answer.name],
  };
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
    setSelectedBranches(branches);
    setShowFilter(!branches);
    setHydrated(true);
  }, []);

  function handleBranchSelect(branches: string[]) {
    localStorage.setItem(LAST_BRANCHES_KEY, JSON.stringify(branches));
    setSelectedBranches(branches);
    router.replace(`/endless-classic?branches=${branches.join(",")}`);
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

function EndlessGameContent({
  storageKey,
  selectedBranches,
  onChangeBranches,
}: {
  storageKey: string;
  selectedBranches: string[] | null;
  onChangeBranches: () => void;
}) {
  const pool = useMemo(
    () =>
      selectedBranches
        ? filterTalentsByBranch(ALL_TALENTS, selectedBranches)
        : ALL_TALENTS,
    [selectedBranches?.join(",")]
  );

  const [state, setState] = useLocalStorageState<EndlessState>(
    storageKey,
    getInitialState(pool),
    isValidEndlessState
  );
  const [showHowTo, setShowHowTo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } = useTalentSearch(pool);

  const { current, stats } = state;
  const guessesLeft = MAX_GUESSES - current.guesses.length;
  const alreadyGuessed = current.guesses.map((g) => g.talent.name);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const makeGuess = useCallback(
    (talent: Talent) => {
      if (current.gameOver) return;
      const result = compareTalents(talent, current.answer);
      const won = talent.name === current.answer.name;
      const newGuesses = [...current.guesses, { talent, result }];
      const gameOver = won || newGuesses.length >= MAX_GUESSES;

      setState((prev) => ({
        ...prev,
        current: { ...prev.current, guesses: newGuesses, gameOver, won },
        stats: gameOver
          ? {
              streak: won ? prev.stats.streak + 1 : 0,
              bestStreak: won
                ? Math.max(prev.stats.bestStreak, prev.stats.streak + 1)
                : prev.stats.bestStreak,
              totalPlayed: prev.stats.totalPlayed + 1,
              totalWon: prev.stats.totalWon + (won ? 1 : 0),
            }
          : prev.stats,
      }));

      clear();
    },
    [current, setState, clear]
  );

  function nextRound() {
    const next = getRandomTalent(pool, state.recentTalents);
    setState((prev) => ({
      ...prev,
      current: { answer: next, guesses: [], gameOver: false, won: false },
      recentTalents: [...prev.recentTalents, next.name].slice(-20),
    }));
    clear();
  }

  const displayCurrentHistory = current.guesses
    .map((g) => ({ talent: g.talent, result: g.result }))
    .reverse();

  return (
    <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
      <Navbar title="ENDLESS" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <PageHeader
            subtitle="Daily Hololive Talent Guessing Game"
            onHowTo={() => setShowHowTo(!showHowTo)}
            onLeaderboard={() => {}}
            showHowTo={showHowTo}
            showLeaderboard={false}
            showLeaderboardButton={false}
          />

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
              style={{
                background: "white",
                borderColor: "var(--holo-border)",
                color: "var(--holo-text-muted)",
              }}
            >
              {current.gameOver ? (
                current.won ? (
                  "Correct! Ready for the next one?"
                ) : (
                  "Wrong — try the next one!"
                )
              ) : (
                <>
                  <span style={{ color: "var(--holo-blue)" }}>●</span> {guessesLeft} guess
                  {guessesLeft !== 1 ? "es" : ""} remaining
                </>
              )}
              {selectedBranches &&
                selectedBranches.length < ALL_BRANCHES.length && (
                  <>
                    <span className="opacity-30">|</span>
                    {selectedBranches.map((b) => (
                      <span
                        key={b}
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: "var(--holo-off-white)",
                          color: "var(--holo-text-muted)",
                        }}
                      >
                        {b}
                      </span>
                    ))}
                  </>
                )}
            </div>
            <button
              type="button"
              onClick={onChangeBranches}
              className="rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors hover:bg-[var(--holo-off-white)]"
              style={{ borderColor: "var(--holo-border)", color: "var(--holo-text-muted)" }}
            >
              Change branches
            </button>
          </div>
        </div>

        {showHowTo && <HowToPlay maxGuesses={MAX_GUESSES} classic={false} />}

        <StatsBar
          streak={stats.streak}
          bestStreak={stats.bestStreak}
          totalPlayed={stats.totalPlayed}
          totalWon={stats.totalWon}
        />

        {current.gameOver && (
          <GameOverBanner
            won={current.won}
            answerName={current.answer.name}
            guessCount={current.guesses.length}
          >
            <button
              onClick={nextRound}
              className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
              style={{ background: "var(--holo-blue)" }}
            >
              Next talent →
            </button>
          </GameOverBanner>
        )}

        {!current.gameOver && (
          <TalentSearchInput
            input={input}
            suggestions={suggestions}
            showDropdown={showDropdown}
            onInput={(val) => handleInput(val, alreadyGuessed)}
            onGuess={makeGuess}
            onClear={clear}
            onFocus={onFocus}
            dropdownRef={dropdownRef}
          />
        )}

        {current.guesses.length > 0 && (
          <ColumnHeaders headers={DEFAULT_COLUMN_HEADERS} />
        )}

        <div className="space-y-2">
          {displayCurrentHistory.map(({ talent, result }, i) => (
            <GuessRow key={talent.name} guess={talent} result={result} index={i} />
          ))}
        </div>

        {pool.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
              No talents match the selected branches.
            </p>
            <p className="text-xs mt-1 opacity-50" style={{ color: "var(--holo-text-muted)" }}>
              <button
                type="button"
                onClick={onChangeBranches}
                className="underline"
              >
                Choose different branches
              </button>
            </p>
          </div>
        ) : !current.gameOver && current.guesses.length === 0 && (
          <div className="text-center py-14">
            <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
              Start typing to make your first guess!
            </p>
            <p className="text-xs mt-1 opacity-50" style={{ color: "var(--holo-text-muted)" }}>
              {pool.length} talent{pool.length !== 1 ? "s" : ""} in the pool
            </p>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}

export default function EndlessGame() {
  return (
    <Suspense fallback={null}>
      <EndlessGamePage />
    </Suspense>
  );
}
