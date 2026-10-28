"use client";

import Modal from "@/components/ui/Modal";
import { DIFFICULTY_META, type CropAreaData, type Talent } from "@/lib/avatar-crops";

interface CropsReviewModalProps {
  talent: Talent;
  natural: { w: number; h: number };
  area: CropAreaData;
  label: string;
  onClose: () => void;
}

export default function CropsReviewModal({
  talent,
  natural,
  area,
  label,
  onClose,
}: CropsReviewModalProps) {
  const maxW = Math.min(360, typeof window !== "undefined" ? window.innerWidth - 48 : 360);
  const sx = maxW / Math.max(area.w, 1);
  const sy = maxW / Math.max(area.h, 1);
  const height = maxW;

  return (
    <Modal onClose={onClose} label="Review crop area">
      <div style={{ padding: "1.25rem" }}>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--holo-text)" }}>
            {label} — {talent.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "var(--holo-off-white)",
              border: "1.5px solid var(--holo-border)",
              borderRadius: 8,
              width: 30,
              height: 30,
              cursor: "pointer",
              fontWeight: 800,
              color: "var(--holo-text-muted)",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            marginTop: "0.75rem",
            margin: "0.75rem auto 0",
            width: maxW,
            height,
            borderRadius: 12,
            overflow: "hidden",
            border: "1.5px solid var(--holo-border)",
            backgroundImage: `url(${talent.avatar_url || talent.image_url})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${natural.w * sx}px ${natural.h * sy}px`,
            backgroundPosition: `${-area.x * sx}px ${-area.y * sy}px`,
          }}
        />

        <div
          style={{
            marginTop: "0.75rem",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {DIFFICULTY_META[area.difficulty] && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: DIFFICULTY_META[area.difficulty].color,
                background: DIFFICULTY_META[area.difficulty].bg,
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {DIFFICULTY_META[area.difficulty].label}
            </span>
          )}
          {(
            [
              ["x", area.x],
              ["y", area.y],
              ["width", area.w],
              ["height", area.h],
            ] as const
          ).map(([k, v]) => (
            <span
              key={k}
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "var(--holo-blue-dark)",
                background: "rgba(0,180,216,0.10)",
                border: "1px solid rgba(0,180,216,0.25)",
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {k}: {Math.round(v)}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: "1rem",
            width: "100%",
            padding: "9px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, var(--holo-blue), var(--holo-blue-dark))",
            color: "#fff",
            fontFamily: '"Baloo 2", sans-serif',
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
