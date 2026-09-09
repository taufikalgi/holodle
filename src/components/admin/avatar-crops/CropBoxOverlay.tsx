import type { MouseEvent as ReactMouseEvent } from "react";
import {
  DIFFICULTY_META,
  type Corner,
  type CropBox,
  type EditableArea,
} from "@/lib/avatar-crops";

const HANDLE_CURSOR: Record<Corner, string> = {
  nw: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  se: "nwse-resize",
};

export type ToDisplay = (box: CropBox) => {
  left: number;
  top: number;
  width: number;
  height: number;
};

export default function CropBoxOverlay({
  areas,
  selectedKey,
  toDisplay,
  onBoxMouseDown,
  onHandleMouseDown,
  onRemove,
  onSelect,
}: {
  areas: EditableArea[];
  selectedKey: string | null;
  toDisplay: ToDisplay;
  onBoxMouseDown: (e: ReactMouseEvent, area: EditableArea) => void;
  onHandleMouseDown: (e: ReactMouseEvent, area: EditableArea, corner: Corner) => void;
  onRemove: (key: string) => void;
  onSelect: (key: string | null) => void;
}) {
  return (
    <>
      {areas.map((area, i) => {
        const selected = area.key === selectedKey;
        const dispBox = toDisplay(area);
        return (
          <div
            key={area.key}
            onMouseDown={(e) => onBoxMouseDown(e, area)}
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
                    onMouseDown={(e) => onHandleMouseDown(e, area, corner)}
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
    </>
  );
}
