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
import AvatarGuessList from "@/components/avatar/AvatarGuessList";
import AvatarSuggestion from "@/components/avatar/AvatarSuggestion";
import StatusPill from "@/components/game/StatusPill";
import {
  AvatarEmptyBlock,
  AvatarErrorBlock,
  LoadingBlock,
  ZeroGuessHint,
} from "@/components/game/GameShell";
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
  lastRunStreak: 0,
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
          lastRunStreak: correct ? prev.stats.streak + 1 : prev.stats.streak,
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

          <StatusPill
            status={roundState.gameOver ? (roundState.won ? "won" : "lost") : "playing"}
            guessesLeft={guessesLeft}
            variant="endless"
          />
        </div>

        {showHowTo && <AvatarHowToPlay />}

        <StatsBar
          streak={persisted.stats.streak}
          bestStreak={persisted.stats.bestStreak}
          totalPlayed={persisted.stats.totalPlayed}
          totalWon={persisted.stats.totalWon}
        />

        {roundStatus === "loading" && <LoadingBlock text="Loading a new avatar…" />}

        {roundStatus === "noValid" && (
          <AvatarEmptyBlock onRetry={() => void startRound(pool, persisted.recentTalentIds)} />
        )}

        {roundStatus === "error" && (
          <AvatarErrorBlock
            message={roundError}
            onRetry={() => void startRound(pool, persisted.recentTalentIds)}
          />
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
                          mode: "AVATAR ENDLESS",
                          guessCount: guesses.length,
                          maxGuesses: MAX_GUESSES,
                          streak: persisted.lastRunStreak,
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
                renderSuggestion={(t) => <AvatarSuggestion talent={t} />}
              />
            )}

            {guesses.length > 0 && <AvatarGuessList guesses={displayGuessHistory} />}

            {!roundState.gameOver && guesses.length === 0 && (
              <ZeroGuessHint
                compact
                line1="Start typing to make your first guess!"
                line2={
                  pool.length > 0
                    ? `${pool.length} playable talent${pool.length !== 1 ? "s" : ""}`
                    : undefined
                }
              />
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
