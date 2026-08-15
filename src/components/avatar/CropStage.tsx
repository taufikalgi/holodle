"use client";

import { useEffect, useRef, useState } from "react";
import type { CropArea } from "@/lib/avatar-crops";

const MAX_W = 460;
const MAX_H = 460;

interface CropFrameProps {
  src: string;
  natural: { w: number; h: number };
  area: CropArea;
  width: number;
  height: number;
  radius?: number;
  ariaLabel?: string;
}

function CropFrame({
  src,
  natural,
  area,
  width,
  height,
  radius = 14,
  ariaLabel,
}: CropFrameProps) {
  const scale = Math.max(width / Math.max(area.w, 1), height / Math.max(area.h, 1));
  return (
    <div
      className="relative overflow-hidden"
      aria-label={ariaLabel}
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundImage: `url(${src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${natural.w * scale}px ${natural.h * scale}px`,
        backgroundPosition: `${-area.x * scale + (width - area.w * scale) / 2}px ${
          -area.y * scale + (height - area.h * scale) / 2
        }px`,
        flexShrink: 0,
      }}
    />
  );
}

interface CropStageProps {
  src: string;
  areas: CropArea[];
  revealedCount: number;
  fullReveal: boolean;
  answerName: string;
}

export default function CropStage({
  src,
  areas,
  revealedCount,
  fullReveal,
  answerName,
}: CropStageProps) {
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [disp, setDisp] = useState({ w: 0, h: 0 });
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const count = Math.max(1, Math.min(revealedCount, areas.length));
  const current = areas[count - 1] ?? null;
  const past = areas.slice(0, count - 1);

  useEffect(() => {
    setError(false);
    setNatural({ w: 0, h: 0 });
  }, [src]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !natural.w || !natural.h || !current) return;
    const calc = () => {
      const availW = Math.min(el.clientWidth, MAX_W);
      const ratio = Math.max(current.h, 1) / Math.max(current.w, 1);
      let w = availW;
      let h = w * ratio;
      if (h > MAX_H) {
        h = MAX_H;
        w = h / ratio;
      }
      setDisp({ w: Math.round(w), h: Math.round(h) });
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [natural, current]);

  if (!src || areas.length === 0) return null;

  return (
    <div ref={containerRef} className="w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt=""
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            setNatural({ w: img.naturalWidth, h: img.naturalHeight });
          }
        }}
        onError={() => setError(true)}
        style={{ display: "none" }}
      />

      {error ? (
        <div
          className="mx-auto rounded-2xl flex items-center justify-center"
          style={{
            maxWidth: MAX_W,
            aspectRatio: "1 / 1",
            background: "var(--holo-off-white)",
            border: "1.5px solid var(--holo-border)",
            color: "var(--holo-text-muted)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Avatar image failed to load.
        </div>
      ) : natural.w === 0 || !current ? (
        <div
          className="mx-auto rounded-2xl"
          style={{
            maxWidth: MAX_W,
            aspectRatio: "1 / 1",
            background: "var(--holo-off-white)",
            border: "1.5px solid var(--holo-border)",
            animation: "pulse 1.5s ease infinite",
          }}
        />
      ) : fullReveal ? (
        <div
          className="relative mx-auto overflow-hidden rounded-2xl"
          style={{
            maxWidth: MAX_W,
            maxHeight: MAX_H,
            aspectRatio: `${natural.w} / ${natural.h}`,
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: "1.5px solid var(--holo-border)",
          }}
        >
          <div
            className="absolute inset-0 flex items-end justify-center pb-4"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
          >
            <span
              className="rounded-full px-4 py-1.5 text-sm font-black"
              style={{ background: "#fff", color: "var(--holo-text)" }}
            >
              {answerName}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible w-full md:w-auto md:max-h-[420px] md:overflow-y-auto">
            {past.map((area, i) => (
              <div key={`past-${i}`} className="flex flex-col items-center gap-1 shrink-0">
                <CropFrame
                  src={src}
                  natural={natural}
                  area={area}
                  width={76}
                  height={76}
                  radius={12}
                  ariaLabel={`Hint ${i + 1}`}
                />
              </div>
            ))}
          </div>

          {disp.w > 0 && disp.h > 0 ? (
            <div className="relative mx-auto">
              <CropFrame
                src={src}
                natural={natural}
                area={current}
                width={disp.w}
                height={disp.h}
                radius={18}
                ariaLabel={`Current hint ${count}`}
              />
              <span
                className="absolute top-2 right-2 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
                style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
              >
                {count}/{areas.length} hints
              </span>
            </div>
          ) : (
            <div
              className="mx-auto rounded-2xl"
              style={{
                maxWidth: MAX_W,
                aspectRatio: "1 / 1",
                background: "var(--holo-off-white)",
                border: "1.5px solid var(--holo-border)",
                animation: "pulse 1.5s ease infinite",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
