"use client";

import { useRef } from "react";
import type { Talent, CompareResult } from "@/lib/talents";
import {
  ColumnHeaders,
  DEFAULT_COLUMN_HEADERS,
  GuessRow,
  TalentSearchInput,
} from "@/components/ui";
import { useTalentSearch } from "@/hooks/useTalentSearch";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { ZeroGuessHint } from "@/components/game/GameShell";

export default function ClassicBoard({
  pool,
  guesses,
  gameOver,
  onGuess,
}: {
  pool: Talent[];
  guesses: { talent: Talent; result: CompareResult }[];
  gameOver: boolean;
  onGuess: (talent: Talent) => boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { input, suggestions, showDropdown, handleInput, clear, onFocus, setShowDropdown } =
    useTalentSearch(pool);

  useOutsideClick(dropdownRef, () => setShowDropdown(false), inputRef);

  const alreadyGuessed = guesses.map((guess) => guess.talent.name);
  const zeroHintLine2 = `${pool.length} talent${pool.length === 1 ? "" : "s"} in the pool`;

  const handleGuess = (talent: Talent) => {
    if (onGuess(talent)) clear();
  };

  const history = [...guesses].reverse();

  return (
    <>
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
        />
      )}

      {guesses.length > 0 && <ColumnHeaders headers={DEFAULT_COLUMN_HEADERS} />}

      <div className="space-y-2">
        {history.map(({ talent, result }, index) => (
          <GuessRow key={talent.name} guess={talent} result={result} index={index} />
        ))}
      </div>

      {!gameOver && guesses.length === 0 && (
        <ZeroGuessHint
          line1="Start typing to make your first guess!"
          line2={zeroHintLine2}
        />
      )}
    </>
  );
}
