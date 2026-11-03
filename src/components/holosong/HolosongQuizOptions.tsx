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
    <div className="grid gap-3 mb-5">
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
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${tone}`}
    >
      {option.artwork_url ? (
        <img
          src={option.artwork_url}
          alt={option.title}
          className="h-12 w-12 rounded-xl object-cover"
        />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--holo-off-white)] text-lg">
          🎵
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-black text-[var(--holo-text)]">
          {option.title}
        </span>
        <span className="block truncate text-xs text-[var(--holo-text-muted)]">
          {option.artist}
        </span>
      </span>
      {correct && <span className="ml-auto text-lg">✓</span>}
      {wrong && <span className="ml-auto text-lg">✗</span>}
    </button>
  );
}
