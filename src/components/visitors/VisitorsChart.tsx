"use client";

import { useState } from "react";
import {
  formatCompactNumber,
  formatVisitorDate,
  getChartMax,
  metricValue,
  type VisitorMetric,
  type VisitorStatsPoint,
} from "@/lib/visitors-api";

const METRICS: { key: VisitorMetric; label: string }[] = [
  { key: "active_players", label: "Active players" },
  { key: "sessions", label: "Sessions" },
  { key: "guesses", label: "Guesses" },
];

export default function VisitorsChart({ series }: { series: VisitorStatsPoint[] }) {
  const [metric, setMetric] = useState<VisitorMetric>("active_players");
  const max = getChartMax(series, metric);
  const metricLabel = METRICS.find((item) => item.key === metric)?.label ?? "Activity";

  if (series.length === 0) {
    return (
      <section className="holo-card p-6 mb-6 text-center">
        <p className="text-sm font-semibold text-[var(--holo-text-muted)]">
          No activity recorded for this range yet.
        </p>
      </section>
    );
  }

  return (
    <section className="holo-card p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--holo-text)]">
          Daily activity
        </h2>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Chart metric">
          {METRICS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMetric(item.key)}
              aria-pressed={metric === item.key}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                metric === item.key
                  ? "bg-[var(--holo-blue)] text-white"
                  : "text-[var(--holo-text-muted)] hover:bg-[var(--holo-off-white)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        role="img"
        aria-label={`${metricLabel} per day for the selected range`}
        className="flex h-44 items-end gap-1"
      >
        {series.map((point) => {
          const value = metricValue(point, metric);
          const height = max > 0 ? Math.max(2, (value / max) * 100) : 0;
          return (
            <div
              key={point.date}
              className="flex h-full min-w-0 flex-1 items-end"
              title={`${point.date}: ${formatCompactNumber(value)} ${metricLabel.toLowerCase()}`}
            >
              <div
                className="w-full rounded-t-sm bg-[var(--holo-blue)]"
                style={{ height: `${height}%`, minHeight: value > 0 ? 2 : 0 }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] font-semibold text-[var(--holo-text-muted)]">
        <span>{formatVisitorDate(series[0].date)}</span>
        {series.length > 1 && (
          <span>{formatVisitorDate(series[series.length - 1].date)}</span>
        )}
      </div>
    </section>
  );
}
