import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentPlayer, getGame } from "@/lib/data";
import { SEAT_LABEL, VARIANT_LABEL, formatMoney, stakeLabel } from "@/lib/types";
import { RevealList } from "@/components/charts/reveal-list";
import { CountUp } from "@/components/charts/count-up";

const PLACE = ["1st", "2nd", "3rd", "4th"];

export default async function GamePage({ params }: PageProps<"/games/[id]">) {
  const { id } = await params;
  const me = await getCurrentPlayer();
  if (!me) redirect("/");
  const result = await getGame(id);
  if (!result) notFound();
  const { game, seats } = result;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <Link href="/games" className="text-sm text-muted hover:text-ivory">
          ← History
        </Link>
        <h1 className="font-display text-3xl mt-2">
          {game.venue?.name ?? "Unknown venue"}
          {game.venue?.city ? <span className="text-muted"> · {game.venue.city}</span> : null}
        </h1>
        <p className="text-muted mt-1">
          {new Date(game.played_at).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })} ·{" "}
          {VARIANT_LABEL[game.variant]} · <span className="font-mono">{stakeLabel(game)}</span>
        </p>
        {game.notes ? <p className="mt-3 text-ivory/80 italic">“{game.notes}”</p> : null}
      </div>

      <RevealList className="card divide-y divide-line" step={110}>
        {seats.map((s) => {
          const delta = s.rating_after - s.rating_before;
          const mine = s.player_id === me.id;
          return (
            <div key={s.id} className={`reveal flex items-center gap-4 p-4 ${mine ? "bg-jade/5" : ""}`}>
              <span
                className={`w-12 h-12 shrink-0 rounded-lg grid place-items-center font-display text-xl ${
                  s.placement === 1 ? "bg-gold text-bg" : s.placement === 4 ? "bg-seal/20 text-seal" : "bg-surface-2"
                }`}
              >
                {PLACE[s.placement - 1]}
              </span>
              <div className="flex-1 min-w-0">
                <Link href={`/players/${s.player_id}`} className="hover:underline">
                  {s.player?.display_name}
                  {mine ? <span className="text-muted text-sm"> (you)</span> : null}
                </Link>
                <div className="text-xs text-muted">{SEAT_LABEL[s.seat]}</div>
              </div>
              <div className="text-right">
                <div className={`font-mono text-lg ${s.net_result >= 0 ? "text-jade" : "text-seal"}`}>
                  {formatMoney(s.net_result, game.currency)}
                </div>
                <div className="text-xs font-mono text-muted">
                  {Math.round(s.rating_before)} →{" "}
                  <CountUp value={s.rating_after} className={delta >= 0 ? "text-jade" : "text-seal"} duration={1000} />{" "}
                  <span className={delta >= 0 ? "text-jade" : "text-seal"}>
                    ({delta >= 0 ? "+" : ""}
                    {delta.toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </RevealList>
    </div>
  );
}
