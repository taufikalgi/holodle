"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { Corner, CropBox, EditableArea, MockTalent } from "@/lib/avatar-crops";

const MAX_CONTAINER_HEIGHT = 520;
const MIN_SIZE = 8;

const HANDLE_CURSOR: Record<Corner, string> = {
  nw: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  se: "nwse-resize",
};

type Drag =
  | { mode: "draw"; start: { x: number; y: number } }
  | { mode: "move"; key: string; orig: CropBox; start: { x: number; y: number } }
  | { mode: "resize"; key: string; corner: Corner; orig: CropBox; start: { x: number; y: number } };

function normRect(a: { x: number; y: number }, b: { x: number; y: number }) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  };
}

function clampBox(box: CropBox, nat: { w: number; h: number }): CropBox {
  const w = Math.max(Math.min(box.w, nat.w), MIN_SIZE);
  const h = Math.max(Math.min(box.h, nat.h), MIN_SIZE);
  const x = Math.min(Math.max(box.x, 0), Math.max(nat.w - w, 0));
  const y = Math.min(Math.max(box.y, 0), Math.max(nat.h - h, 0));
  return { x, y, w, h };
}

function resizeBox(orig: CropBox, corner: Corner, dx: number, dy: number) {
  let b = { ...orig };
  if (corner.includes("e")) b.w = orig.w + dx;
  if (corner.includes("s")) b.h = orig.h + dy;
  if (corner.includes("w")) {
    b.x = orig.x + dx;
    b.w = orig.w - dx;
  }
  if (corner.includes("n")) {
    b.y = orig.y + dy;
    b.h = orig.h - dy;
  }
  return b;
}

interface CropEditorProps {
  talent: MockTalent;
  areas: EditableArea[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  onAdd: (box: CropBox) => void;
  onUpdate: (key: string, box: CropBox) => void;
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
  onRemove,
  onNaturalSize,
}: CropEditorProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [disp, setDisp] = useState({ w: 0, h: 0 });
  const [preview, setPreview] = useState<CropBox | null>(null);

  const dragRef = useRef<Drag | null>(null);
  const previewRef = useRef<CropBox | null>(null);
  const scaleRef = useRef(0);
  const naturalRef = useRef(natural);

  const propsRef = useRef({ onAdd, onUpdate, onSelect, onRemove });
  propsRef.current = { onAdd, onUpdate, onSelect, onRemove };

  const scale = natural.w ? disp.w / natural.w : 0;
  scaleRef.current = scale;
  naturalRef.current = natural;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !natural.w || !natural.h) return;
    const calc = () => {
      const s = Math.min(el.clientWidth / natural.w, MAX_CONTAINER_HEIGHT / natural.h);
      setDisp({ w: Math.round(natural.w * s), h: Math.round(natural.h * s) });
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [natural]);

  useEffect(() => {
    const handleMove = (e: globalThis.MouseEvent) => {
      const d = dragRef.current;
      const areaEl = areaRef.current;
      if (!d || !areaEl) return;
      const rect = areaEl.getBoundingClientRect();
      const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const s = scaleRef.current;

      if (d.mode === "draw") {
        const box = normRect(d.start, pos);
        previewRef.current = box;
        setPreview(box);
        return;
      }

      const dx = (pos.x - d.start.x) / s;
      const dy = (pos.y - d.start.y) / s;

      if (d.mode === "move") {
        const orig = { x: d.orig.x + dx, y: d.orig.y + dy, w: d.orig.w, h: d.orig.h };
        propsRef.current.onUpdate(d.key, clampBox(orig, naturalRef.current));
      } else {
        const b = resizeBox(d.orig, d.corner, dx, dy);
        propsRef.current.onUpdate(d.key, clampBox(b, naturalRef.current));
      }
    };

    const handleUp = () => {
      const d = dragRef.current;
      if (d?.mode === "draw") {
        const p = previewRef.current;
        const s = scaleRef.current;
        if (p && p.w >= 12 && p.h >= 12) {
          propsRef.current.onAdd(
            clampBox({ x: p.x / s, y: p.y / s, w: p.w / s, h: p.h / s }, naturalRef.current)
          );
        }
        previewRef.current = null;
        setPreview(null);
      }
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (selectedKey) {
        propsRef.current.onRemove(selectedKey);
        propsRef.current.onSelect(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedKey]);

  const toDisplay = (b: CropBox) => ({
    left: Math.round(b.x * scale),
    top: Math.round(b.y * scale),
    width: Math.round(b.w * scale),
    height: Math.round(b.h * scale),
  });

  const handleImageMouseDown = (e: ReactMouseEvent) => {
    if (e.button !== 0) return;
    const areaEl = areaRef.current;
    if (!areaEl) return;
    const rect = areaEl.getBoundingClientRect();
    const start = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragRef.current = { mode: "draw", start };
    previewRef.current = { x: start.x, y: start.y, w: 0, h: 0 };
    setPreview(previewRef.current);
    e.preventDefault();
  };

  const handleBoxMouseDown = (e: ReactMouseEvent, area: EditableArea) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const areaEl = areaRef.current;
    if (!areaEl) return;
    const rect = areaEl.getBoundingClientRect();
    onSelect(area.key);
    dragRef.current = {
      mode: "move",
      key: area.key,
      orig: { x: area.x, y: area.y, w: area.w, h: area.h },
      start: { x: e.clientX - rect.left, y: e.clientY - rect.top },
    };
  };

  const handleHandleMouseDown = (e: ReactMouseEvent, area: EditableArea, corner: Corner) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const areaEl = areaRef.current;
    if (!areaEl) return;
    const rect = areaEl.getBoundingClientRect();
    onSelect(area.key);
    dragRef.current = {
      mode: "resize",
      key: area.key,
      corner,
      orig: { x: area.x, y: area.y, w: area.w, h: area.h },
      start: { x: e.clientX - rect.left, y: e.clientY - rect.top },
    };
  };

  const loaded = natural.w > 0 && natural.h > 0;

  return (
    <div ref={wrapRef} style={{ width: "100%", userSelect: "none" }}>
      <img
        src={talent.imageUrl}
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
          {talent.imageUrl ? "Loading image…" : "No image"}
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
            src={talent.imageUrl}
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
        </div>
      )}
    </div>
  );
}
