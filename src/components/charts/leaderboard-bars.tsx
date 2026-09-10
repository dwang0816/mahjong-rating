"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

interface Row {
  id: string;
  name: string;
  rating: number;
  games: number;
  registered: boolean;
  isMe: boolean;
}

/** Leaderboard where each bar grows from the lowest rating on record to the player's rating. */
export function LeaderboardBars({ players }: { players: Row[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const min = Math.min(...players.map((p) => p.rating), 1500) - 40;
  const max = Math.max(...players.map((p) => p.rating), 1500) + 40;

  useEffect(() => {
    if (!ref.current) return;
    const rows = ref.current.querySelectorAll<HTMLElement>("[data-row]");
    const bars = ref.current.querySelectorAll<HTMLElement>("[data-bar]");
    const a = animate(rows, { opacity: [0, 1], translateX: [-8, 0], delay: stagger(50), duration: 350, ease: "outCubic" });
    const b = animate(bars, {
      width: (el?: unknown) => ["0%", `${(el as HTMLElement).dataset.pct}%`],
      delay: stagger(50, { start: 100 }),
      duration: 800,
      ease: "outExpo",
    });
    return () => {
      a.revert();
      b.revert();
    };
  }, [players]);

  if (!players.length) return <p className="text-muted text-sm">Nobody yet.</p>;

  return (
    <div ref={ref} className="flex flex-col gap-2">
      {players.map((p, i) => (
        <Link
          key={p.id}
          href={`/players/${p.id}`}
          data-row
          className={`reveal grid grid-cols-[2rem_10rem_1fr_4rem] items-center gap-3 text-sm rounded-lg px-2 py-1 hover:bg-surface-2 ${p.isMe ? "bg-jade/5" : ""}`}
        >
          <span className="font-mono text-muted">{i + 1}</span>
          <span className="truncate">
            {p.name}
            {!p.registered ? <span className="text-muted text-xs"> · unclaimed</span> : null}
          </span>
          <span className="h-2 rounded-full bg-surface-2 overflow-hidden">
            <span
              data-bar
              data-pct={Math.round(((p.rating - min) / (max - min)) * 100)}
              className="block h-full rounded-full"
              style={{ width: 0, background: p.isMe ? "var(--gold)" : "var(--jade)" }}
            />
          </span>
          <span className="font-mono text-right">
            {Math.round(p.rating)}
            <span className="text-muted text-xs block">{p.games}g</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
