import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllPlayers, getCurrentPlayer, getOpponents, getPlayerGames, type OpponentSummary } from "@/lib/data";
import { formatMoney, stakeLabel } from "@/lib/types";
import { RevealList } from "@/components/charts/reveal-list";
import { Card } from "@/components/player-dashboard";
import { LeaderboardBars } from "@/components/charts/leaderboard-bars";

interface Suggestion {
  player: OpponentSummary["player"];
  reasons: string[];
  score: number;
  record?: string;
}

export default async function PlayersPage() {
  const me = await getCurrentPlayer();
  if (!me) redirect("/");
  const myRating = Number(me.rating);
  const [players, opponents, myGames] = await Promise.all([getAllPlayers(), getOpponents(me), getPlayerGames(me.id)]);

  const myStakes = new Set(myGames.map((g) => stakeLabel(g.game)));
  const myVenues = new Set(myGames.map((g) => g.game.venue?.name).filter(Boolean));
  const byId = new Map(opponents.map((o) => [o.player.id, o]));

  const suggestions: Suggestion[] = players
    .filter((p) => p.id !== me.id)
    .map((p) => {
      const opp = byId.get(p.id);
      const gap = Number(p.rating) - myRating;
      const reasons: string[] = [];
      let score = 0;

      if (Math.abs(gap) <= 50) {
        score += 3;
        reasons.push(`Rated within ${Math.abs(Math.round(gap))} of you: even table`);
      } else if (gap > 50) {
        score += 1.5;
        reasons.push(`Rated ${Math.round(gap)} above you: good for climbing`);
      } else {
        reasons.push(`Rated ${Math.abs(Math.round(gap))} below you: low upside`);
      }

      if (opp) {
        const sharedStakes = opp.sharedStakes.filter((s) => myStakes.has(s));
        const sharedVenues = opp.sharedVenues.filter((v) => myVenues.has(v));
        if (sharedStakes.length) {
          score += 1.5;
          reasons.push(`Plays your stakes: ${sharedStakes.join(", ")}`);
        }
        if (sharedVenues.length) {
          score += 1;
          reasons.push(`Same tables: ${sharedVenues.join(", ")}`);
        }
        if (opp.myWinsVsThem > opp.theirWinsVsMe) {
          score += 1;
          reasons.push(`You finish above them ${opp.myWinsVsThem}–${opp.theirWinsVsMe}`);
        } else if (opp.theirWinsVsMe > opp.myWinsVsThem) {
          score -= 0.5;
          reasons.push(`They finish above you ${opp.theirWinsVsMe}–${opp.myWinsVsThem}`);
        }
      } else if (p.games_played > 0) {
        reasons.push("Never shared a table with you");
      } else {
        score -= 2;
        reasons.push("No games on record");
      }

      return {
        player: p,
        reasons,
        score,
        record: opp ? `${opp.myWinsVsThem}–${opp.theirWinsVsMe} · ${opp.sharedGames} shared` : undefined,
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-muted text-sm">Community</p>
        <h1 className="font-display text-3xl">Players</h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <Card title="Who to play with" subtitle="ranked by rating fit, shared stakes and venues, and your record" className="lg:col-span-3">
          {suggestions.length ? (
            <RevealList className="flex flex-col divide-y divide-line -mx-5" step={90}>
              {suggestions.slice(0, 5).map((s, i) => (
                <div key={s.player.id} className="reveal px-5 py-3 flex gap-4">
                  <span className="font-display text-2xl text-muted w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <Link href={`/players/${s.player.id}`} className="hover:underline font-semibold">
                        {s.player.display_name}
                      </Link>
                      <span className="font-mono text-jade text-sm">{Math.round(Number(s.player.rating))}</span>
                      {s.record ? <span className="text-xs text-muted">{s.record}</span> : null}
                    </div>
                    <ul className="text-sm text-muted mt-1">
                      {s.reasons.map((r) => (
                        <li key={r}>· {r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </RevealList>
          ) : (
            <p className="text-muted text-sm">Log a game to get suggestions.</p>
          )}
        </Card>

        <Card title="Head to head" subtitle="your net result against people you have played" className="lg:col-span-2">
          {opponents.length ? (
            <RevealList className="flex flex-col gap-3" step={70}>
              {opponents.map((o) => (
                <Link key={o.player.id} href={`/players/${o.player.id}`} className="reveal flex justify-between items-center hover:bg-surface-2 -mx-2 px-2 py-1 rounded-lg">
                  <span>
                    <span className="block">{o.player.display_name}</span>
                    <span className="text-xs text-muted">
                      {o.myWinsVsThem}–{o.theirWinsVsMe} over {o.sharedGames} game{o.sharedGames === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="text-right text-sm font-mono">
                    {Object.entries(o.netVsThem).map(([cur, net]) => (
                      <span key={cur} className={`block ${net >= 0 ? "text-jade" : "text-seal"}`}>
                        {formatMoney(net, cur)}
                      </span>
                    ))}
                  </span>
                </Link>
              ))}
            </RevealList>
          ) : (
            <p className="text-muted text-sm">No opponents yet.</p>
          )}
        </Card>
      </div>

      <Card title="Leaderboard" subtitle="every player on record, by Elo rating">
        <LeaderboardBars
          players={players.map((p) => ({
            id: p.id,
            name: p.display_name,
            rating: Number(p.rating),
            games: p.games_played,
            registered: !!p.profile_id,
            isMe: p.id === me.id,
          }))}
        />
      </Card>
    </div>
  );
}
