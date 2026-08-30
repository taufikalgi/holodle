"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL_TALENTS, type Talent } from "@/lib/talents";
import {
  Footer,
  GameOverBanner,
  Navbar,
  PageHeader,
  ShareButton,
  StatsBar,
  TalentSearchInput,
} from "@/components/ui";
import { buildAvatarShareText } from "@/lib/share";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useTalentSearch } from "@/hooks/useTalentSearch";
import {
  fetchAvatarAreas,
  fetchAvatarTalents,
  getAvatarTalentPool,
  pickRandomAvatarTalent,
} from "@/lib/avatar-api";
import CropStage from "@/components/avatar/CropStage";
import AvatarHowToPlay from "@/components/avatar/AvatarHowToPlay";
import {
  isValidEndlessPersisted,
  isValidEndlessRoundState,
  type EndlessPersisted,
  type EndlessRoundState,
} from "@/components/avatar/types";

const MAX_GUESSES = 5;
const ROUND_KEY = "holodle-avatar-endless-round";
const STATS_KEY = "holodle-avatar-endless-stats";

const emptyRound: EndlessRoundState = { round: null, guesses: [], gameOver: false, won: false };
const emptyPersisted: EndlessPersisted = {
  stats: { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0 },
  recentTalentIds: [],
};

type RoundStatus = "loading" | "ready" | "noValid" | "error";

function EndlessGamePage() {
  const [roundState, setRoundState] = useLocalStorageState<EndlessRoundState>(
    ROUND_KEY,
    emptyRound,
    isValidEndlessRoundState
  );
  const [persisted, setPersisted] = useLocalStorageState<EndlessPersisted>(
    STATS_KEY,
    emptyPersisted,
    isValidEndlessPersisted
  );
  const [roundStatus, setRoundStatus] = useState<RoundStatus>(
    roundState.round ? "ready" : "loading"
  );
  const [roundError, setRoundError] = useState("");
  const [validTalents, setValidTalents] = useState<Talent[]>(ALL_TALENTS);
  const [showHowTo, setShowHowTo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasStoredRoundRef = useRef(Boolean(roundState.round));
  const recentTalentIdsRef = useRef(persisted.recentTalentIds);

  const pool = useMemo(() => {
    const round = roundState.round;
    if (!round) return validTalents;
    return validTalents.some((t) => t.id === round.talent.id)
      ? validTalents
      : [...validTalents, round.talent];
  }, [validTalents, roundState.round]);

  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } =
    useTalentSearch(pool);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const startRound = useCallback(
    async (talentPool: Talent[], avoid: string[]) => {
      setRoundStatus("loading");
      setRoundError("");

      if (talentPool.length === 0) {
        setRoundStatus("noValid");
        return null;
      }

      try {
        const talent = pickRandomAvatarTalent(talentPool, avoid);
        if (!talent) {
          setRoundStatus("noValid");
          return null;
        }
        const areas = await fetchAvatarAreas(talent.id);
        const round = { talent, areas };
        setRoundState({ round, guesses: [], gameOver: false, won: false });
        setPersisted((prev) => ({
          ...prev,
          recentTalentIds: [...prev.recentTalentIds, talent.id].slice(-20),
        }));
        setRoundStatus("ready");
        return round;
      } catch (e) {
        setRoundError(e instanceof Error ? e.message : "Failed to load round");
        setRoundStatus("error");
        return null;
      }
    },
    [setRoundState, setPersisted]
  );

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const avatarTalents = await fetchAvatarTalents();
        if (!alive) return;

        const playableTalents = getAvatarTalentPool(avatarTalents);
        setValidTalents(playableTalents);

        if (hasStoredRoundRef.current) {
          setRoundStatus("ready");
          return;
        }

        await startRound(playableTalents, recentTalentIdsRef.current);
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
  }, [startRound]);

  const makeGuess = useCallback(
    (talent: Talent) => {
      const { round } = roundState;
      if (!round || roundState.gameOver) return;
      if (roundState.guesses.some((g) => g.talent.name === talent.name)) return;
      const correct = talent.name === round.talent.name;
      const newGuesses = [...roundState.guesses, { talent, correct }];
      const gameOver = correct || newGuesses.length >= MAX_GUESSES;
      setRoundState({ ...roundState, guesses: newGuesses, gameOver, won: correct });
      if (gameOver) {
        setPersisted((prev) => ({
          ...prev,
          stats: {
            streak: correct ? prev.stats.streak + 1 : 0,
            bestStreak: correct
              ? Math.max(prev.stats.bestStreak, prev.stats.streak + 1)
              : prev.stats.bestStreak,
            totalPlayed: prev.stats.totalPlayed + 1,
            totalWon: correct ? prev.stats.totalWon + 1 : prev.stats.totalWon,
          },
        }));
      }
      clear();
    },
    [roundState, setRoundState, setPersisted, clear]
  );

  const nextRound = useCallback(async () => {
    const finishedId = roundState.round?.talent.id;
    const avoid = finishedId
      ? [...persisted.recentTalentIds, finishedId]
      : persisted.recentTalentIds;
    await startRound(pool, avoid);
  }, [pool, persisted.recentTalentIds, roundState.round, startRound]);

  const { round, guesses } = roundState;
  const guessesLeft = MAX_GUESSES - guesses.length;
  const alreadyGuessed = guesses.map((g) => g.talent.name);
  const revealedCount = round ? Math.min(guesses.length + 1, round.areas.length) : 0;
  const displayGuessHistory = [...guesses].reverse();

  return (
    <main className="min-h-screen" style={{ background: "var(--holo-bg)" }}>
      <Navbar title="AVATAR ENDLESS" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <PageHeader
            subtitle="Who is this talent?"
            onHowTo={() => setShowHowTo(!showHowTo)}
            showHowTo={showHowTo}
          />

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border"
            style={{
              background: "var(--holo-bg-card)",
              borderColor: "var(--holo-border)",
              color: "var(--holo-text-muted)",
            }}
          >
            {roundState.gameOver ? (
              roundState.won ? (
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
          </div>
        </div>

        {showHowTo && <AvatarHowToPlay />}

        <StatsBar
          streak={persisted.stats.streak}
          bestStreak={persisted.stats.bestStreak}
          totalPlayed={persisted.stats.totalPlayed}
          totalWon={persisted.stats.totalWon}
        />

        {roundStatus === "loading" && (
          <div className="text-center py-14">
            <p
              className="text-sm font-semibold animate-pulse"
              style={{ color: "var(--holo-text-muted)" }}
            >
              Loading a new avatar…
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
              onClick={() => void startRound(pool, persisted.recentTalentIds)}
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
              onClick={() => void startRound(pool, persisted.recentTalentIds)}
              className="underline font-black"
            >
              Retry
            </button>
          </div>
        )}

        {roundStatus === "ready" && round && (
          <>
            <div className="holo-card p-4 mb-5">
              <CropStage
                key={round.talent.id}
                src={round.talent.avatarUrl || round.talent.photoUrl}
                areas={round.areas}
                revealedCount={revealedCount}
                fullReveal={roundState.gameOver}
                answerName={round.talent.name}
              />
            </div>

            {roundState.gameOver && (
              <GameOverBanner
                won={roundState.won}
                answerName={round.talent.name}
                guessCount={guesses.length}
                actions={
                  !roundState.won ? (
                    <div>
                      <ShareButton
                        text={buildAvatarShareText({
                          guesses: guesses.map((g) => g.correct),
                        })}
                      />
                    </div>
                  ) : undefined
                }
              >
                <button
                  type="button"
                  onClick={() => void nextRound()}
                  className="mt-4 px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
                  style={{ background: "var(--holo-blue)" }}
                >
                  {roundState.won ? "Next talent →" : "New run →"}
                </button>
              </GameOverBanner>
            )}

            {!roundState.gameOver && (
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

            {guesses.length > 0 && (
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

            {!roundState.gameOver && guesses.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm font-semibold" style={{ color: "var(--holo-text-muted)" }}>
                  Start typing to make your first guess!
                </p>
                {pool.length > 0 && (
                  <p
                    className="text-xs mt-1 opacity-50"
                    style={{ color: "var(--holo-text-muted)" }}
                  >
                    {pool.length} playable talent{pool.length !== 1 ? "s" : ""}
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

export default function AvatarEndlessGame() {
  return (
    <Suspense fallback={null}>
      <EndlessGamePage />
    </Suspense>
  );
}
