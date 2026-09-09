"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL_TALENTS, getDateString, type Talent } from "@/lib/talents";
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
  getAvatarTalentOfTheDay,
  getAvatarTalentPool,
} from "@/lib/avatar-api";
import CropStage from "@/components/avatar/CropStage";
import AvatarHowToPlay from "@/components/avatar/AvatarHowToPlay";
import AvatarGuessList from "@/components/avatar/AvatarGuessList";
import AvatarSuggestion from "@/components/avatar/AvatarSuggestion";
import StatusPill from "@/components/game/StatusPill";
import StreakResetModal from "@/components/game/StreakResetModal";
import {
  AvatarEmptyBlock,
  AvatarErrorBlock,
  LoadingBlock,
  ZeroGuessHint,
} from "@/components/game/GameShell";
import { isValidDailyState, type DailyState } from "@/components/avatar/types";
import type { DailyStreakStats } from "@/lib/daily-streak";
import { useDailyStreak } from "@/hooks/useDailyStreak";

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

const emptyStats: DailyStreakStats = { streak: 0, bestStreak: 0, totalPlayed: 0, totalWon: 0, lastPlayedDate: undefined };

type RoundStatus = "loading" | "ready" | "noValid" | "error";

export default function AvatarGame() {
  const [state, setState] = useLocalStorageState<DailyState>(ROUND_KEY, emptyRound, (d) =>
    isValidDailyState(d, getDateString())
  );
  const { stats, streakResetToast, dismissStreakResetPopup, recordDailyGameOver } =
    useDailyStreak(STATS_KEY, emptyStats);
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
        recordDailyGameOver(getDateString(), correct);
      }
      clear();
    },
    [state, setState, recordDailyGameOver, clear]
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

          <StatusPill
            status={state.gameOver ? (state.won ? "won" : "lost") : "playing"}
            guessesLeft={guessesLeft}
            variant="daily"
          />
        </header>

        {showHowTo && <AvatarHowToPlay daily />}

        <StreakResetModal open={streakResetToast} onClose={dismissStreakResetPopup} />

        <StatsBar
          streak={stats.streak}
          bestStreak={stats.bestStreak}
          totalPlayed={stats.totalPlayed}
          totalWon={stats.totalWon}
        />

        {roundStatus === "loading" && <LoadingBlock text="Loading today's avatar…" />}

        {roundStatus === "noValid" && (
          <AvatarEmptyBlock onRetry={() => void loadRound(validTalents)} />
        )}

        {roundStatus === "error" && (
          <AvatarErrorBlock message={roundError} onRetry={() => void loadRound(validTalents)} />
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
                actions={
                  <div>
                    <ShareButton
                      text={buildAvatarShareText({
                        mode: "AVATAR",
                        guessCount: state.guesses.length,
                        maxGuesses: MAX_GUESSES,
                        guesses: state.guesses.map((g) => g.correct),
                        won: state.won,
                      })}
                    />
                  </div>
                }
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
                renderSuggestion={(t) => <AvatarSuggestion talent={t} />}
              />
            )}

            {state.guesses.length > 0 && <AvatarGuessList guesses={displayGuessHistory} />}

            {!state.gameOver && state.guesses.length === 0 && (
              <ZeroGuessHint
                compact
                line1="Start typing to make your first guess!"
                line2={
                  searchPool.length > 0
                    ? `${searchPool.length} playable talent${searchPool.length !== 1 ? "s" : ""}`
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
