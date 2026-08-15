"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL_TALENTS, getDateString, type Talent } from "@/lib/talents";
import {
  Footer,
  GameOverBanner,
  Navbar,
  PageHeader,
  StatsBar,
  TalentSearchInput,
} from "@/components/ui";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useTalentSearch } from "@/hooks/useTalentSearch";
import {
  fetchAvatarAreas,
  fetchAvatarTalents,
  getAvatarTalentOfTheDay,
  getAvatarTalentPool,
} from "@/lib/avatar-api";
import CropStage from "@/components/avatar/CropStage";
import AvatarHowToPlay from "@/components/avatar/AvatarHowToPlay";
import { isValidDailyState, type AvatarStats, type DailyState } from "@/components/avatar/types";

const MAX_GUESSES = 5;
const ROUND_KEY = "holodle-avatar-round";
const STATS_KEY = "holodle-avatar-stats";

const emptyRound: DailyState = {
  talent: null,
  areas: [],
  guesses: [],
  gameOver: false,
  won: false,
  date: getDateString(),
};

const emptyStats: AvatarStats = { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0 };

type RoundStatus = "loading" | "ready" | "noValid" | "error";

export default function AvatarGame() {
  const [state, setState] = useLocalStorageState<DailyState>(ROUND_KEY, emptyRound, (d) =>
    isValidDailyState(d, getDateString())
  );
  const [stats, setStats] = useLocalStorageState<AvatarStats>(STATS_KEY, emptyStats);
  const [roundStatus, setRoundStatus] = useState<RoundStatus>(state.talent ? "ready" : "loading");
  const [roundError, setRoundError] = useState("");
  const [validTalents, setValidTalents] = useState<Talent[]>(ALL_TALENTS);
  const [showHowTo, setShowHowTo] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasStoredRoundRef = useRef(Boolean(state.talent));

  const searchPool = useMemo(() => {
    const talent = state.talent;
    if (!talent) return validTalents;
    return validTalents.some((t) => t.id === talent.id) ? validTalents : [...validTalents, talent];
  }, [validTalents, state.talent]);

  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } =
    useTalentSearch(searchPool);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const loadRound = useCallback(
    async (pool: Talent[]) => {
      setRoundStatus("loading");
      setRoundError("");

      if (pool.length === 0) {
        setRoundStatus("noValid");
        return;
      }

      const roundTalent = getAvatarTalentOfTheDay(pool, getDateString());
      if (!roundTalent) {
        setRoundStatus("noValid");
        return;
      }

      try {
        const areas = await fetchAvatarAreas(roundTalent.id);
        setState((prev) =>
          prev.talent
            ? prev
            : {
                talent: roundTalent,
                areas,
                guesses: [],
                gameOver: false,
                won: false,
                date: getDateString(),
              }
        );
        setRoundStatus("ready");
      } catch (e) {
        setRoundError(e instanceof Error ? e.message : "Failed to load round");
        setRoundStatus("error");
      }
    },
    [setState]
  );

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const avatarTalents = await fetchAvatarTalents();
        if (!alive) return;

        const pool = getAvatarTalentPool(avatarTalents);
        setValidTalents(pool);

        if (hasStoredRoundRef.current) {
          setRoundStatus("ready");
          return;
        }

        await loadRound(pool);
      } catch {
        if (!alive) return;

        setValidTalents([]);
        if (hasStoredRoundRef.current) {
          setRoundStatus("ready");
          return;
        }

        setRoundStatus("error");
        setRoundError("Failed to load avatar talents");
      }
    };

    void load();

    return () => {
      alive = false;
    };
  }, [loadRound]);

  const guessesLeft = MAX_GUESSES - state.guesses.length;
  const alreadyGuessed = state.guesses.map((g) => g.talent.name);
  const revealedCount = state.talent ? Math.min(state.guesses.length + 1, state.areas.length) : 0;
  const displayGuessHistory = [...state.guesses].reverse();

  const makeGuess = useCallback(
    (talent: Talent) => {
      if (state.gameOver || !state.talent) return;
      if (state.guesses.some((g) => g.talent.name === talent.name)) return;
      const correct = talent.name === state.talent.name;
      const newGuesses = [...state.guesses, { talent, correct }];
      const gameOver = correct || newGuesses.length >= MAX_GUESSES;
      setState({
        ...state,
        guesses: newGuesses,
        gameOver,
        won: correct,
        date: getDateString(),
      });
      if (gameOver) {
        setStats({
          streak: correct ? stats.streak + 1 : 0,
          bestStreak: correct ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak,
          totalPlayed: stats.totalPlayed + 1,
          totalWon: correct ? stats.totalWon + 1 : stats.totalWon,
        });
      }
      clear();
    },
    [state, stats, setState, setStats, clear]
  );

  return (
    <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
      <Navbar title="AVATAR" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <PageHeader
            subtitle="Who is this talent?"
            onHowTo={() => setShowHowTo(!showHowTo)}
            showHowTo={showHowTo}
          />

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
            style={{
              background: "white",
              borderColor: "var(--holo-border)",
              color: "var(--holo-text-muted)",
            }}
          >
            {state.gameOver ? (
              state.won ? (
                <>
                  <span className="text-green-500">●</span> You found them! 🎉
                </>
              ) : (
                <>
                  <span className="text-red-400">●</span> Game over — come back tomorrow!
                </>
              )
            ) : (
              <>
                <span style={{ color: "var(--holo-blue)" }}>●</span> {guessesLeft} guess
                {guessesLeft !== 1 ? "es" : ""} remaining
              </>
            )}
          </div>
        </header>

        {showHowTo && <AvatarHowToPlay daily />}

        <StatsBar
          streak={stats.streak}
          bestStreak={stats.bestStreak}
          totalPlayed={stats.totalPlayed}
          totalWon={stats.totalWon}
        />

        {roundStatus === "loading" && (
          <div className="text-center py-14">
            <p
              className="text-sm font-semibold animate-pulse"
              style={{ color: "var(--holo-text-muted)" }}
            >
              Loading today&apos;s avatar…
            </p>
          </div>
        )}

        {roundStatus === "noValid" && (
          <div className="holo-card p-8 text-center">
            <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
              No playable talents yet.
            </p>
            <button
              type="button"
              onClick={() => void loadRound(validTalents)}
              className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
              style={{ background: "var(--holo-blue)" }}
            >
              Retry
            </button>
          </div>
        )}

        {roundStatus === "error" && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {roundError}{" "}
            <button
              type="button"
              onClick={() => void loadRound(validTalents)}
              className="underline font-black"
            >
              Retry
            </button>
          </div>
        )}

        {roundStatus === "ready" && state.talent && (
          <>
            <div className="holo-card p-4 mb-5">
              <CropStage
                key={state.talent.id}
                src={state.talent.avatarUrl || state.talent.photoUrl}
                areas={state.areas}
                revealedCount={revealedCount}
                fullReveal={state.gameOver}
                answerName={state.talent.name}
              />
            </div>

            {state.gameOver && (
              <GameOverBanner
                won={state.won}
                answerName={state.talent.name}
                guessCount={state.guesses.length}
                revealed={revealAnswer}
                onReveal={state.won ? undefined : () => setRevealAnswer(true)}
                message="Come back tomorrow for a new talent!"
              />
            )}

            {!state.gameOver && (
              <TalentSearchInput
                input={input}
                suggestions={suggestions}
                showDropdown={showDropdown}
                onInput={(val) => handleInput(val, alreadyGuessed)}
                onGuess={makeGuess}
                onClear={clear}
                onFocus={onFocus}
                dropdownRef={dropdownRef}
                renderSuggestion={(t) => (
                  <>
                    {t.avatarUrl ? (
                      <img
                        src={t.avatarUrl}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <span className="text-xl">🖼️</span>
                    )}
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--holo-text)" }}>
                        {t.name}
                      </div>
                      <div className="text-xs" style={{ color: "var(--holo-text-muted)" }}>
                        {t.branch} • {t.debutYear}
                      </div>
                    </div>
                  </>
                )}
              />
            )}

            {state.guesses.length > 0 && (
              <div className="holo-card p-4 mb-5 space-y-2">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "var(--holo-text-muted)" }}
                >
                  Your guesses
                </p>
                {displayGuessHistory.map((g, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold ${
                      g.correct ? "cell-correct" : "cell-wrong"
                    }`}
                  >
                    {g.talent.avatarUrl ? (
                      <img
                        src={g.talent.avatarUrl}
                        alt={g.talent.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">🖼️</span>
                    )}
                    <span>{g.talent.name}</span>
                    <span className="ml-auto">{g.correct ? "✓ Correct!" : "✗ Wrong"}</span>
                  </div>
                ))}
              </div>
            )}

            {!state.gameOver && state.guesses.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
                  Start typing to make your first guess!
                </p>
                {searchPool.length > 0 && (
                  <p
                    className="text-xs mt-1 opacity-50"
                    style={{ color: "var(--holo-text-muted)" }}
                  >
                    {searchPool.length} playable talent{searchPool.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <Footer />
      </div>
    </main>
  );
}
