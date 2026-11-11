"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import type { Talent } from "@/lib/talents";
import type { CropArea } from "@/lib/avatar-crops";
import type { AvatarGuess, RoundStatus } from "./types";
import CropStage from "./CropStage";
import AvatarGuessList from "./AvatarGuessList";
import AvatarSuggestion from "./AvatarSuggestion";
import { TalentSearchInput } from "@/components/ui";
import { useTalentSearch } from "@/hooks/useTalentSearch";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  AvatarEmptyBlock,
  AvatarErrorBlock,
  LoadingBlock,
  ZeroGuessHint,
} from "@/components/game/GameShell";

export default function AvatarRoundBoard({
  talent,
  areas,
  guesses,
  gameOver,
  searchPool,
  roundStatus,
  roundError,
  loadingText,
  onRetry,
  onGuess,
  banner,
}: {
  talent: Talent | null;
  areas: CropArea[];
  guesses: AvatarGuess[];
  gameOver: boolean;
  searchPool: Talent[];
  roundStatus: RoundStatus;
  roundError: string;
  loadingText: string;
  onRetry: () => void;
  onGuess: (talent: Talent) => boolean;
  banner: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } =
    useTalentSearch(searchPool);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const alreadyGuessed = guesses.map((guess) => guess.talent.name);

  const handleGuess = (next: Talent) => {
    if (onGuess(next)) clear();
  };

  if (roundStatus === "loading") return <LoadingBlock text={loadingText} />;
  if (roundStatus === "noValid") return <AvatarEmptyBlock onRetry={onRetry} />;
  if (roundStatus === "error") {
    return <AvatarErrorBlock message={roundError} onRetry={onRetry} />;
  }
  if (!talent) return null;

  const revealedCount = Math.min(guesses.length + 1, areas.length);
  const history = [...guesses].reverse();

  return (
    <>
      <div className="holo-card p-4 mb-5">
        <CropStage
          key={talent.id}
          src={talent.avatarUrl || talent.photoUrl}
          areas={areas}
          revealedCount={revealedCount}
          fullReveal={gameOver}
          answerName={talent.name}
        />
      </div>

      {banner}

      {!gameOver && (
        <TalentSearchInput
          input={input}
          suggestions={suggestions}
          showDropdown={showDropdown}
          onInput={(value) => handleInput(value, alreadyGuessed)}
          onGuess={handleGuess}
          onClear={clear}
          onFocus={onFocus}
          dropdownRef={dropdownRef}
          renderSuggestion={(next) => <AvatarSuggestion talent={next} />}
        />
      )}

      {guesses.length > 0 && <AvatarGuessList guesses={history} />}

      {!gameOver && guesses.length === 0 && (
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
  );
}
