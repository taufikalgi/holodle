"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
} from "react";
import { clampBox, normRect, resizeBox } from "@/lib/crop-geometry";
import type { Corner, CropBox, EditableArea } from "@/lib/avatar-crops";

export const MAX_CONTAINER_HEIGHT = 520;

type Drag =
  | { mode: "draw"; start: { x: number; y: number } }
  | { mode: "move"; key: string; orig: CropBox; start: { x: number; y: number } }
  | { mode: "resize"; key: string; corner: Corner; orig: CropBox; start: { x: number; y: number } };

export function useCropDrag({
  natural,
  disp,
  setDisp,
  selectedKey,
  onAdd,
  onUpdate,
  onSelect,
  onRemove,
}: {
  natural: { w: number; h: number };
  disp: { w: number; h: number };
  setDisp: Dispatch<SetStateAction<{ w: number; h: number }>>;
  selectedKey: string | null;
  onAdd: (box: CropBox) => void;
  onUpdate: (key: string, box: CropBox) => void;
  onSelect: (key: string | null) => void;
  onRemove: (key: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const [preview, setPreview] = useState<CropBox | null>(null);

  const dragRef = useRef<Drag | null>(null);
  const previewRef = useRef<CropBox | null>(null);
  const scaleRef = useRef(0);
  const naturalRef = useRef(natural);

  const propsRef = useRef({ onAdd, onUpdate, onSelect, onRemove });
  // eslint-disable-next-line react-hooks/refs -- latest-ref-for-handlers: keeps callbacks fresh without re-subscribing effects
  propsRef.current = { onAdd, onUpdate, onSelect, onRemove };

  const scale = natural.w ? disp.w / natural.w : 0;
  // eslint-disable-next-line react-hooks/refs -- latest-ref-for-handlers: mirrors derived scale for event handlers
  scaleRef.current = scale;
  // eslint-disable-next-line react-hooks/refs -- latest-ref-for-handlers: mirrors natural size for event handlers
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
  }, [natural, setDisp]);

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
        previewRef.current = { x: box.x / s, y: box.y / s, w: box.w / s, h: box.h / s };
        setPreview(previewRef.current);
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
          propsRef.current.onAdd(clampBox({ x: p.x, y: p.y, w: p.w, h: p.h }, naturalRef.current));
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
    const s = scaleRef.current;
    const start = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragRef.current = { mode: "draw", start };
    previewRef.current = { x: start.x / s, y: start.y / s, w: 0, h: 0 };
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

  return {
    wrapRef,
    areaRef,
    preview,
    scale,
    toDisplay,
    handleImageMouseDown,
    handleBoxMouseDown,
    handleHandleMouseDown,
  };
}
