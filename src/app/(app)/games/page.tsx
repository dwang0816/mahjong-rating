import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPlayer, getPlayerGames } from "@/lib/data";
import { RevealList } from "@/components/charts/reveal-list";
import { GameRowItem } from "@/components/game-row";

export default async function GamesPage() {
  const me = await getCurrentPlayer();
  if (!me) redirect("/");
  const games = (await getPlayerGames(me.id)).reverse();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted text-sm">Match history</p>
          <h1 className="font-display text-3xl">
            {games.length} game{games.length === 1 ? "" : "s"}
          </h1>
        </div>
        <Link href="/games/new" className="btn btn-primary">
          + Log a game
        </Link>
      </div>
      <div className="card p-2">
        {games.length ? (
          <RevealList className="flex flex-col" step={40}>
            {games.map((row) => (
              <GameRowItem key={row.id} row={row} />
            ))}
          </RevealList>
        ) : (
          <p className="text-muted text-sm p-4">No games logged yet.</p>
        )}
      </div>
    </div>
  );
}
