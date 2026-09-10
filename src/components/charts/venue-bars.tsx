"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import type { VenueStat } from "@/lib/data";
import { formatMoney } from "@/lib/types";
import { seriesColor } from "./palette";

/** Horizontal bars: games per venue, with net result and win rate per venue. */
export function VenueBars({ venues }: { venues: VenueStat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const max = Math.max(1, ...venues.map((v) => v.games));

  useEffect(() => {
    if (!ref.current || !venues.length) return;
    const bars = ref.current.querySelectorAll<HTMLElement>("[data-bar]");
    const rows = ref.current.querySelectorAll<HTMLElement>("[data-row]");
    const a = animate(rows, { opacity: [0, 1], translateY: [8, 0], delay: stagger(70), duration: 400, ease: "outCubic" });
    const b = animate(bars, {
      width: (el?: unknown) => ["0%", `${(el as HTMLElement).dataset.pct}%`],
      delay: stagger(70, { start: 150 }),
      duration: 900,
      ease: "outExpo",
    });
    return () => {
      a.revert();
      b.revert();
    };
  }, [venues]);

  if (!venues.length) return <p className="text-muted text-sm">No venues yet.</p>;

  return (
    <div ref={ref} className="flex flex-col gap-3">
      {venues.map((v, i) => (
        <div key={`${v.name}${v.city}`} data-row className="reveal">
          <div className="flex justify-between text-sm mb-1 gap-3">
            <span className="truncate">
              {v.name}
              {v.city ? <span className="text-muted"> · {v.city}</span> : null}
            </span>
            <span className={`font-mono shrink-0 ${v.net >= 0 ? "text-jade" : "text-seal"}`}>
              {formatMoney(v.net, v.currency)}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
            <div
              data-bar
              data-pct={Math.round((v.games / max) * 100)}
              className="h-full rounded-full"
              style={{ width: 0, background: seriesColor(i) }}
            />
          </div>
          <div className="text-xs text-muted mt-1">
            {v.games} game{v.games === 1 ? "" : "s"} · {v.wins} win{v.wins === 1 ? "" : "s"}
          </div>
        </div>
      ))}
    </div>
  );
}
