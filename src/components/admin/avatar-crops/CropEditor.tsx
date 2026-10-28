"use client";

import { useState } from "react";
import {
  type CropBox,
  type Difficulty,
  type EditableArea,
  type CropArea,
  type Talent,
} from "@/lib/avatar-crops";
import { MAX_CONTAINER_HEIGHT, useCropDrag } from "./useCropDrag";
import CropBoxOverlay from "./CropBoxOverlay";
import CropPreview from "./CropPreview";
import DifficultyBar from "./DifficultyBar";

interface CropEditorProps {
  talent: Talent;
  areas: EditableArea[];
  generatedPreview: CropArea[];
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
  generatedPreview,
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
        className="hidden"
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

          <CropPreview preview={preview} toDisplay={toDisplay} />

          {generatedPreview.map((area, i) => {
            const box = {
              x: (area.x / 1000) * natural.w,
              y: (area.y / 1000) * natural.h,
              w: (area.w / 1000) * natural.w,
              h: (area.h / 1000) * natural.h,
            };
            const display = toDisplay(box);
            const color = {
              easy: "#16a34a",
              medium: "#d97706",
              hard: "#dc2626",
            }[area.difficulty];
            return (
              <div
                key={`generated-${area.id || i}`}
                style={{
                  ...display,
                  position: "absolute",
                  border: `2px solid ${color}`,
                  background: `${color}22`,
                  borderRadius: 4,
                  boxSizing: "border-box",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 1,
                    left: 3,
                    padding: "0 4px",
                    borderRadius: 4,
                    background: color,
                    color: "white",
                    fontSize: 10,
                    lineHeight: "16px",
                    fontWeight: 800,
                  }}
                >
                  AI {area.difficulty} #{i + 1}
                </span>
              </div>
            );
          })}

          <CropBoxOverlay
            areas={areas}
            selectedKey={selectedKey}
            toDisplay={toDisplay}
            onBoxMouseDown={handleBoxMouseDown}
            onHandleMouseDown={handleHandleMouseDown}
            onRemove={onRemove}
            onSelect={onSelect}
          />
        </div>
      )}

      {loaded ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--holo-text-muted)",
            }}
          >
            Drag to draw • {talent.name}
          </span>
          <span style={{ flex: 1 }} />
          <DifficultyBar
            areas={areas}
            selectedKey={selectedKey}
            onSetDifficulty={onSetDifficulty}
          />
        </div>
      ) : null}
    </div>
  );
}
