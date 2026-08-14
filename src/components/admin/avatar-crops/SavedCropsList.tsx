"use client";

import type { CropBox, EditableArea } from "@/lib/avatar-crops";

interface CropThumbProps {
  src: string;
  natural: { w: number; h: number };
  area: CropBox;
  width: number;
  height: number;
  radius?: number;
}

function CropThumb({ src, natural, area, width, height, radius = 10 }: CropThumbProps) {
  const sx = width / Math.max(area.w, 1);
  const sy = height / Math.max(area.h, 1);
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        border: "1.5px solid var(--holo-border)",
        backgroundImage: `url(${src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${natural.w * sx}px ${natural.h * sy}px`,
        backgroundPosition: `${-area.x * sx}px ${-area.y * sy}px`,
        flexShrink: 0,
        overflow: "hidden",
      }}
    />
  );
}

export interface SavedCropsListProps {
  src: string;
  natural: { w: number; h: number };
  areas: EditableArea[];
  savedCount: number;
  onReview: (area: EditableArea) => void;
  onDelete: (key: string) => void;
}

export default function SavedCropsList({
  src,
  natural,
  areas,
  savedCount,
  onReview,
  onDelete,
}: SavedCropsListProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--holo-text)" }}>
          Saved crops
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--holo-blue-dark)",
            background: "rgba(0,180,216,0.10)",
            border: "1px solid rgba(0,180,216,0.25)",
            padding: "2px 10px",
            borderRadius: 20,
          }}
        >
          {savedCount}
        </span>
      </div>

      {areas.length === 0 ? (
        <div
          style={{
            padding: "1.25rem",
            textAlign: "center",
            color: "var(--holo-text-muted)",
            fontSize: 13,
            border: "1.5px dashed var(--holo-border)",
            borderRadius: 12,
          }}
        >
          No saved crops yet.
          <br />
          Draw boxes on the image and press Save.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {areas.map((area, i) => (
            <div
              key={area.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 8,
                borderRadius: 12,
                border: "1.5px solid var(--holo-border)",
                background: "var(--holo-bg-card)",
              }}
            >
              {natural.w > 0 && natural.h > 0 ? (
                <CropThumb src={src} natural={natural} area={area} width={64} height={64} />
              ) : (
                <div
                  style={{
                    width: 64,
                    height: 64,
                    background: "var(--holo-off-white)",
                    borderRadius: 10,
                    border: "1.5px solid var(--holo-border)",
                    animation: "pulse 1.5s ease infinite",
                  }}
                />
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--holo-text)" }}>
                  Area #{i + 1}
                </span>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--holo-text-muted)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  x {Math.round(area.x)} · y {Math.round(area.y)} · {Math.round(area.w)}×
                  {Math.round(area.h)}
                </div>
                {area.dirty && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#a16207",
                      background: "#fef9c3",
                      border: "1px solid #fde047",
                      padding: "1px 7px",
                      borderRadius: 20,
                    }}
                  >
                    unsaved
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => onReview(area)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1.5px solid var(--holo-border)",
                  background: "var(--holo-off-white)",
                  color: "var(--holo-blue-dark)",
                  fontFamily: '"Baloo 2", sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                👁
              </button>
              <button
                type="button"
                onClick={() => onDelete(area.key)}
                aria-label={`Delete area ${i + 1}`}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1.5px solid #fca5a5",
                  background: "#fff1f2",
                  color: "var(--holo-rose)",
                  fontFamily: '"Baloo 2", sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
