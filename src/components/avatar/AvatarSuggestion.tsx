import type { Talent } from "@/lib/talents";

export default function AvatarSuggestion({ talent: t }: { talent: Talent }) {
  return (
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
        <div className="text-sm font-bold text-[var(--holo-text)]">
          {t.name}
        </div>
        <div className="text-xs text-[var(--holo-text-muted)]">
          {t.branch} • {t.debutYear}
        </div>
      </div>
    </>
  );
}
