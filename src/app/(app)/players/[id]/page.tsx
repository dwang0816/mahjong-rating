import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentPlayer, getOpponents, getPlayerById, getPlayerStats } from "@/lib/data";
import { formatMoney } from "@/lib/types";
import { PlayerDashboard } from "@/components/player-dashboard";

export default async function PlayerPage({ params }: PageProps<"/players/[id]">) {
  const { id } = await params;
  const me = await getCurrentPlayer();
  if (!me) redirect("/");
  if (id === me.id) redirect("/dashboard");

  const player = await getPlayerById(id);
  if (!player) notFound();
  const [stats, opponents] = await Promise.all([getPlayerStats(player), getOpponents(me)]);
  const h2h = opponents.find((o) => o.player.id === player.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/players" className="text-sm text-muted hover:text-ivory">
            ← Players
          </Link>
          <h1 className="font-display text-3xl mt-2">
            {player.display_name}
            {!player.profile_id ? <span className="text-muted text-base"> · has not signed up yet</span> : null}
          </h1>
        </div>
        {h2h ? (
          <div className="card px-5 py-3 text-sm">
            <div className="text-xs uppercase tracking-wider text-muted">You vs {player.display_name}</div>
            <div className="mt-1">
              <span className="font-display text-2xl">
                {h2h.myWinsVsThem}–{h2h.theirWinsVsMe}
              </span>{" "}
              <span className="text-muted">over {h2h.sharedGames} shared game{h2h.sharedGames === 1 ? "" : "s"}</span>
            </div>
            <div className="font-mono text-xs mt-1">
              {Object.entries(h2h.netVsThem).map(([cur, net]) => (
                <span key={cur} className={`mr-3 ${net >= 0 ? "text-jade" : "text-seal"}`}>
                  {formatMoney(net, cur)}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="card px-5 py-3 text-sm text-muted">You have not shared a table yet.</div>
        )}
      </div>
      <PlayerDashboard stats={stats} isMe={false} />
    </div>
  );
}
