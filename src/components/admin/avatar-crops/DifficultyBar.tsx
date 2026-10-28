import {
  DIFFICULTY_META,
  type Difficulty,
  type EditableArea,
} from "@/lib/avatar-crops";

export default function DifficultyBar({
  areas,
  selectedKey,
  onSetDifficulty,
}: {
  areas: EditableArea[];
  selectedKey: string | null;
  onSetDifficulty: (key: string, difficulty: Difficulty) => void;
}) {
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(20,20,31,0.85)",
        padding: "6px 10px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginRight: 2 }}>
        Difficulty
      </span>
      {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
        const meta = DIFFICULTY_META[d];
        const selected = areas.find((a) => a.key === selectedKey);
        const active = selected?.difficulty === d;
        return (
          <button
            key={d}
            type="button"
            disabled={!selected}
            onClick={(e) => {
              e.stopPropagation();
              if (selected) onSetDifficulty(selected.key, d);
            }}
            title={selected ? `Set difficulty to ${meta.label}` : "Select a crop first"}
            style={{
              fontSize: 11,
              fontWeight: 800,
              padding: "3px 10px",
              borderRadius: 20,
              border: active ? "2px solid #fff" : `1px solid ${meta.bg}`,
              background: meta.bg,
              color: meta.color,
              cursor: selected ? "pointer" : "not-allowed",
              opacity: selected ? 1 : 0.45,
            }}
          >
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
