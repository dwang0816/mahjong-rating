"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

const COLORS = ["var(--gold)", "var(--jade)", "var(--sky)", "var(--seal)"];
const LABELS = ["1st", "2nd", "3rd", "4th"];

/** Vertical bars: how often the player finishes in each position. */
export function PlacementBars({ placements }: { placements: number[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const max = Math.max(1, ...placements);
  const total = placements.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!ref.current) return;
    const bars = ref.current.querySelectorAll<HTMLElement>("[data-bar]");
    const a = animate(bars, {
      scaleY: [0, 1],
      delay: stagger(100, { start: 200 }),
      duration: 800,
      ease: "outElastic(1, .8)",
    });
    return () => {
      a.revert();
    };
  }, [placements]);

  return (
    <div ref={ref} className="grid grid-cols-4 gap-3 h-40 items-end">
      {placements.map((n, i) => (
        <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
          <span className="text-xs font-mono text-muted">{total ? Math.round((n / total) * 100) : 0}%</span>
          <div
            data-bar
            className="w-full rounded-t-md origin-bottom"
            style={{ height: `${(n / max) * 100}%`, background: COLORS[i], transform: "scaleY(0)", minHeight: n ? 4 : 0 }}
          />
          <span className="text-xs text-muted">{LABELS[i]}</span>
        </div>
      ))}
    </div>
  );
}
