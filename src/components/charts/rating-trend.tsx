"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, stagger, svg } from "animejs";
import type { RatingPoint } from "@/lib/data";

const W = 600;
const H = 200;
const PAD = { l: 44, r: 16, t: 16, b: 28 };

/** Rating over time, drawn as an SVG line that traces itself in. */
export function RatingTrend({ history }: { history: RatingPoint[] }) {
  const ref = useRef<SVGSVGElement>(null);

  const geometry = useMemo(() => {
    if (history.length < 2) return null;
    const ratings = history.map((p) => p.rating);
    const min = Math.floor((Math.min(...ratings) - 20) / 10) * 10;
    const max = Math.ceil((Math.max(...ratings) + 20) / 10) * 10;
    const x = (i: number) => PAD.l + (i / (history.length - 1)) * (W - PAD.l - PAD.r);
    const y = (r: number) => PAD.t + (1 - (r - min) / (max - min || 1)) * (H - PAD.t - PAD.b);
    const points = history.map((p, i) => ({ x: x(i), y: y(p.rating), ...p }));
    const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const ticks = [min, Math.round((min + max) / 2), max];
    return { points, path, ticks, y, min, max };
  }, [history]);

  useEffect(() => {
    if (!ref.current || !geometry) return;
    const [line] = svg.createDrawable(ref.current.querySelector<SVGPathElement>("path[data-line]")!);
    const a = animate(line, { draw: ["0 0", "0 1"], duration: 1400, ease: "inOutSine" });
    const dots = ref.current.querySelectorAll("circle[data-dot]");
    const b = animate(dots, {
      scale: [0, 1],
      opacity: [0, 1],
      delay: stagger(1400 / Math.max(dots.length, 1)),
      duration: 300,
      ease: "outBack",
    });
    return () => {
      a.revert();
      b.revert();
    };
  }, [geometry]);

  if (!geometry) return <p className="text-muted text-sm">Play two games to see a trend.</p>;

  const last = geometry.points[geometry.points.length - 1];
  const first = geometry.points[0];
  const up = last.rating >= first.rating;

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {geometry.ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={geometry.y(t)} y2={geometry.y(t)} stroke="var(--border)" strokeDasharray="3 4" />
          <text x={PAD.l - 8} y={geometry.y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)" fontFamily="var(--font-geist-mono)">
            {t}
          </text>
        </g>
      ))}
      <path data-line d={geometry.path} fill="none" stroke={up ? "var(--jade)" : "var(--seal)"} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {geometry.points.map((p, i) => (
        <circle
          key={p.gameId + i}
          data-dot
          cx={p.x}
          cy={p.y}
          r="3.5"
          fill="var(--bg)"
          stroke={up ? "var(--jade)" : "var(--seal)"}
          strokeWidth="2"
          style={{ transformOrigin: `${p.x}px ${p.y}px`, transformBox: "fill-box" }}
        >
          <title>{`${p.longLabel} · ${p.rating.toFixed(0)}`}</title>
        </circle>
      ))}
      <text x={first.x} y={H - 8} fontSize="11" fill="var(--muted)">
        {first.shortLabel}
      </text>
      <text x={last.x} y={H - 8} fontSize="11" fill="var(--muted)" textAnchor="end">
        {last.shortLabel}
      </text>
    </svg>
  );
}
