export interface AvatarGuessItem {
  talent: { name: string; avatarUrl?: string | null };
  correct: boolean;
}

export default function AvatarGuessList({ guesses }: { guesses: AvatarGuessItem[] }) {
  if (guesses.length === 0) return null;
  return (
    <div className="holo-card p-4 mb-5 space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[var(--holo-text-muted)]">
        Your guesses
      </p>
      {guesses.map((g, i) => (
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
  );
}
