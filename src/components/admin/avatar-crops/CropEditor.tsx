"use client";

import { useState } from "react";
import {
  type CropBox,
  type Difficulty,
  type EditableArea,
  type Talent,
} from "@/lib/avatar-crops";
import { MAX_CONTAINER_HEIGHT, useCropDrag } from "./useCropDrag";
import CropBoxOverlay from "./CropBoxOverlay";
import CropPreview from "./CropPreview";
import DifficultyBar from "./DifficultyBar";

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

          <CropBoxOverlay
            areas={areas}
            selectedKey={selectedKey}
            toDisplay={toDisplay}
            onBoxMouseDown={handleBoxMouseDown}
            onHandleMouseDown={handleHandleMouseDown}
            onRemove={onRemove}
            onSelect={onSelect}
          />

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

          <DifficultyBar
            areas={areas}
            selectedKey={selectedKey}
            onSetDifficulty={onSetDifficulty}
          />
        </div>
      )}
    </div>
  );
}
