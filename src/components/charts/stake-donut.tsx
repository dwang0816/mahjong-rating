"use client";

import { useEffect, useRef } from "react";
import { animate, stagger, svg } from "animejs";
import type { Slice } from "@/lib/data";
import { seriesColor } from "./palette";

const R = 42;
const STROKE = 16;

/** Donut of how many games were played at each stake, drawn arc by arc with anime.js. */
export function StakeDonut({ slices, total }: { slices: Slice[]; total: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const legendRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!ref.current || !slices.length) return;
    const circles = ref.current.querySelectorAll<SVGCircleElement>("circle[data-slice]");
    const drawables = svg.createDrawable(circles);

    let start = 0;
    const anims = drawables.map((d, i) => {
      const frac = slices[i].count / total;
      const end = start + frac;
      const from = `${start} ${start}`;
      const to = `${start} ${Math.min(end, 1)}`;
      start = end;
      return animate(d, { draw: [from, to], duration: 900, delay: 150 + i * 120, ease: "inOutQuart" });
    });

    const legend = legendRef.current
      ? animate(legendRef.current.querySelectorAll("li"), {
          opacity: [0, 1],
          translateX: [-10, 0],
          delay: stagger(80, { start: 400 }),
          duration: 400,
          ease: "outCubic",
        })
      : null;

    return () => {
      anims.forEach((a) => a.revert());
      legend?.revert();
    };
  }, [slices, total]);

  if (!slices.length) {
    return <p className="text-muted text-sm">No games yet.</p>;
  }

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative w-44 h-44">
        <svg ref={ref} viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--surface-2)" strokeWidth={STROKE} />
          {slices.map((s, i) => (
            <circle
              key={s.label}
              data-slice
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={seriesColor(i)}
              strokeWidth={STROKE}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="font-display text-3xl">{total}</div>
            <div className="text-xs text-muted">games</div>
          </div>
        </div>
      </div>
      <ul ref={legendRef} className="text-sm flex flex-col gap-2 min-w-40">
        {slices.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2 reveal">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seriesColor(i) }} />
            <span className="font-mono">{s.label}</span>
            <span className="text-muted ml-auto">
              {s.count} · {Math.round((s.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
