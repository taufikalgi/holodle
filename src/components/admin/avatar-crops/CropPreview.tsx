import type { CropBox } from "@/lib/avatar-crops";
import type { ToDisplay } from "./CropBoxOverlay";

export default function CropPreview({
  preview,
  toDisplay,
}: {
  preview: CropBox | null;
  toDisplay: ToDisplay;
}) {
  if (!preview) return null;
  return (
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
  );
}
