"use client";

import type { HolosongQuizOption, HolosongQuizSession } from "@/lib/holosong-quiz-api";

export default function HolosongQuizOptions({
  session,
  selectedId,
  disabled,
  onSelect,
}: {
  session: HolosongQuizSession;
  selectedId?: string;
  disabled: boolean;
  onSelect: (songId: string) => void;
}) {
  const finished = session.status !== "ongoing";
  const correctId = session.answer?.id;

  return (
    <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
      {session.options.map((option) => (
        <OptionCard
          key={option.song_id}
          option={option}
          selected={selectedId === option.song_id}
          correct={finished && correctId === option.song_id}
          wrong={finished && selectedId === option.song_id && correctId !== option.song_id}
          disabled={disabled}
          onSelect={() => onSelect(option.song_id)}
        />
      ))}
    </div>
  );
}

function OptionCard({
  option,
  selected,
  correct,
  wrong,
  disabled,
  onSelect,
}: {
  option: HolosongQuizOption;
  selected: boolean;
  correct: boolean;
  wrong: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const tone = correct
    ? "cell-correct"
    : wrong
      ? "cell-wrong"
      : selected
        ? "border-[var(--holo-blue)] bg-[var(--holo-off-white)]"
        : "border-[var(--holo-border)] bg-[var(--holo-bg-card)] hover:bg-[var(--holo-off-white)]";

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex h-full min-w-0 flex-col items-center gap-2 rounded-2xl border p-2 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:p-3 ${tone}`}
    >
      <span className="relative block w-full overflow-hidden rounded-xl">
        {option.artwork_url ? (
          <img
            src={option.artwork_url}
            alt={option.title}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <span className="flex aspect-square w-full items-center justify-center bg-[var(--holo-off-white)] text-2xl">
            🎵
          </span>
        )}
        {correct && (
          <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-black text-white">
            ✓
          </span>
        )}
        {wrong && (
          <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white">
            ✗
          </span>
        )}
      </span>
      <span className="block w-full truncate text-xs font-black text-[var(--holo-text)] sm:text-sm">
        {option.title}
      </span>
      <span className="block w-full truncate text-[10px] text-[var(--holo-text-muted)] sm:text-xs">
        {option.artist}
      </span>
    </button>
  );
}
