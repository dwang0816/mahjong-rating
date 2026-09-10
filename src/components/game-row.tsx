import Link from "next/link";
import type { GameRow } from "@/lib/data";
import { VARIANT_LABEL, formatMoney, stakeLabel } from "@/lib/types";

const PLACE = ["1st", "2nd", "3rd", "4th"];

export function GameRowItem({ row }: { row: GameRow }) {
  const g = row.game;
  const delta = row.rating_after - row.rating_before;
  return (
    <Link
      href={`/games/${g.id}`}
      className="reveal flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-2 transition-colors"
    >
      <span
        className={`w-10 h-10 shrink-0 rounded-lg grid place-items-center font-display text-lg ${
          row.placement === 1 ? "bg-gold text-bg" : row.placement === 4 ? "bg-seal/20 text-seal" : "bg-surface-2 text-ivory"
        }`}
      >
        {PLACE[row.placement - 1]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">
          {g.venue?.name ?? "Unknown venue"}
          {g.venue?.city ? <span className="text-muted"> · {g.venue.city}</span> : null}
        </span>
        <span className="block text-xs text-muted">
          {new Date(g.played_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} ·{" "}
          {VARIANT_LABEL[g.variant]} · <span className="font-mono">{stakeLabel(g)}</span>
        </span>
      </span>
      <span className="text-right shrink-0">
        <span className={`block font-mono ${row.net_result >= 0 ? "text-jade" : "text-seal"}`}>
          {formatMoney(row.net_result, g.currency)}
        </span>
        <span className={`block text-xs font-mono ${delta >= 0 ? "text-jade" : "text-seal"}`}>
          {delta >= 0 ? "+" : ""}
          {delta.toFixed(1)} elo
        </span>
      </span>
    </Link>
  );
}
