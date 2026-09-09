"use client";

import { useState } from "react";
import {
  DIFFICULTY_META,
  type Corner,
  type CropBox,
  type Difficulty,
  type EditableArea,
  type Talent,
} from "@/lib/avatar-crops";
import { MAX_CONTAINER_HEIGHT, useCropDrag } from "./useCropDrag";

const HANDLE_CURSOR: Record<Corner, string> = {
  nw: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  se: "nwse-resize",
};

interface CropEditorProps {
  talent: Talent;
  areas: EditableArea[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  onAdd: (box: CropBox) => void;
  onUpdate: (key: string, box: CropBox) => void;
  onSetDifficulty: (key: string, difficulty: Difficulty) => void;
  onRemove: (key: string) => void;
  onNaturalSize: (size: { w: number; h: number }) => void;
}

export default function CropEditor({
  talent,
  areas,
  selectedKey,
  onSelect,
  onAdd,
  onUpdate,
  onSetDifficulty,
  onRemove,
  onNaturalSize,
}: CropEditorProps) {
  const src = talent.avatar_url || talent.image_url;
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [disp, setDisp] = useState({ w: 0, h: 0 });

  const {
    wrapRef,
    areaRef,
    preview,
    toDisplay,
    handleImageMouseDown,
    handleBoxMouseDown,
    handleHandleMouseDown,
  } = useCropDrag({
    natural,
    disp,
    setDisp,
    selectedKey,
    onAdd,
    onUpdate,
    onSelect,
    onRemove,
  });

  const loaded = natural.w > 0 && natural.h > 0;

  return (
    <div ref={wrapRef} style={{ width: "100%", userSelect: "none" }}>
      <img
        src={src}
        alt={talent.name}
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget;
          const size = { w: img.naturalWidth, h: img.naturalHeight };
          if (size.w > 0 && size.h > 0) {
            setNatural(size);
            onNaturalSize(size);
          }
        }}
        style={{ display: "none" }}
      />

      {!loaded ? (
        <div
          style={{
            aspectRatio: "1 / 1",
            maxHeight: MAX_CONTAINER_HEIGHT,
            borderRadius: 12,
            background: "var(--holo-off-white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--holo-border)",
            color: "var(--holo-text-muted)",
            fontWeight: 700,
          }}
        >
          {src ? "Loading image…" : "No image"}
        </div>
      ) : (
        <div
          ref={areaRef}
          onMouseDown={handleImageMouseDown}
          style={{
            position: "relative",
            width: disp.w,
            height: disp.h,
            margin: "0 auto",
            cursor: "crosshair",
            borderRadius: 12,
            overflow: "hidden",
            border: "1.5px solid var(--holo-border)",
            background: "#14141f",
            touchAction: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={talent.name}
            draggable={false}
            style={{ width: disp.w, height: disp.h, display: "block", pointerEvents: "none" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.opacity = "0.15";
            }}
          />

          {preview && (
            <div
              style={{
                ...toDisplay(preview),
                position: "absolute",
                border: "2px dashed var(--holo-blue)",
                borderRadius: 4,
                background: "rgba(0,180,216,0.15)",
                pointerEvents: "none",
                boxSizing: "border-box",
              }}
            />
          )}

          {areas.map((area, i) => {
            const selected = area.key === selectedKey;
            const dispBox = toDisplay(area);
            return (
              <div
                key={area.key}
                onMouseDown={(e) => handleBoxMouseDown(e, area)}
                style={{
                  ...dispBox,
                  position: "absolute",
                  border: selected
                    ? "2.5px solid var(--holo-blue)"
                    : "1.5px dashed var(--holo-blue-light)",
                  background: selected ? "rgba(0,180,216,0.18)" : "rgba(0,180,216,0.06)",
                  borderRadius: 4,
                  cursor: "move",
                  boxSizing: "border-box",
                  zIndex: selected ? 2 : 1,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: 4,
                    fontSize: 11,
                    fontWeight: 800,
                    color: selected ? "var(--holo-blue-dark)" : "var(--holo-blue-dark)",
                    textShadow: "0 1px 2px rgba(255,255,255,0.9)",
                  }}
                >
                  #{i + 1}
                </span>

                <span
                  title={`Difficulty: ${DIFFICULTY_META[area.difficulty]?.label ?? area.difficulty}`}
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 4,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: "1.5px solid #fff",
                    background: DIFFICULTY_META[area.difficulty]?.color ?? "var(--holo-text-muted)",
                  }}
                />

                {selected && (
                  <>
                    {(Object.keys(HANDLE_CURSOR) as Corner[]).map((corner) => (
                      <div
                        key={corner}
                        onMouseDown={(e) => handleHandleMouseDown(e, area, corner)}
                        style={{
                          position: "absolute",
                          width: 14,
                          height: 14,
                          background: "#fff",
                          border: "2.5px solid var(--holo-blue)",
                          borderRadius: 3,
                          cursor: HANDLE_CURSOR[corner],
                          zIndex: 3,
                          ...(corner === "nw" && { left: -9, top: -9 }),
                          ...(corner === "ne" && { right: -9, top: -9 }),
                          ...(corner === "sw" && { left: -9, bottom: -9 }),
                          ...(corner === "se" && { right: -9, bottom: -9 }),
                        }}
                      />
                    ))}
                    <button
                      type="button"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(area.key);
                        onSelect(null);
                      }}
                      aria-label={`Delete area ${i + 1}`}
                      style={{
                        position: "absolute",
                        top: -11,
                        right: -11,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: "none",
                        background: "var(--holo-rose)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 800,
                        lineHeight: 1,
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                        zIndex: 4,
                      }}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 10,
              fontSize: 11,
              fontWeight: 600,
              color: "#fff",
              background: "rgba(0,0,0,0.45)",
              padding: "3px 8px",
              borderRadius: 6,
              pointerEvents: "none",
            }}
          >
            Drag to draw • {talent.name}
          </div>

          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              bottom: 8,
              right: 10,
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
        </div>
      )}
    </div>
  );
}
