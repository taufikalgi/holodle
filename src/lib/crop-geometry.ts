import type { Corner, CropBox } from "@/lib/avatar-crops";

export const MIN_SIZE = 8;

export function normRect(a: { x: number; y: number }, b: { x: number; y: number }) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  };
}

export function clampBox(box: CropBox, nat: { w: number; h: number }): CropBox {
  const w = Math.max(Math.min(box.w, nat.w), MIN_SIZE);
  const h = Math.max(Math.min(box.h, nat.h), MIN_SIZE);
  const x = Math.min(Math.max(box.x, 0), Math.max(nat.w - w, 0));
  const y = Math.min(Math.max(box.y, 0), Math.max(nat.h - h, 0));
  return { x, y, w, h };
}

export function resizeBox(orig: CropBox, corner: Corner, dx: number, dy: number) {
  const b = { ...orig };
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
