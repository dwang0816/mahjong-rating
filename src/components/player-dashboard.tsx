import Link from "next/link";
import type { PlayerStats } from "@/lib/data";
import { VARIANT_LABEL, formatMoney } from "@/lib/types";
import { CountUp } from "@/components/charts/count-up";
import { StakeDonut } from "@/components/charts/stake-donut";
import { VenueBars } from "@/components/charts/venue-bars";
import { RatingTrend } from "@/components/charts/rating-trend";
import { PlacementBars } from "@/components/charts/placement-bars";
import { RevealList } from "@/components/charts/reveal-list";
import { GameRowItem } from "@/components/game-row";

export function PlayerDashboard({ stats, isMe }: { stats: PlayerStats; isMe: boolean }) {
  const { player } = stats;
  const currencies = Object.entries(stats.netByCurrency);
  const recent = [...stats.games].reverse().slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <RevealList className="grid grid-cols-2 lg:grid-cols-4 gap-4" step={80}>
        <Stat label="Rating">
          <CountUp value={Number(player.rating)} className="font-display text-4xl text-jade" />
          <span className="text-xs text-muted block mt-1">peak {Math.round(Number(player.peak_rating))}</span>
        </Stat>
        <Stat label="Games">
          <CountUp value={stats.totalGames} className="font-display text-4xl" />
          <span className="text-xs text-muted block mt-1">
            avg finish {stats.avgPlacement ? stats.avgPlacement.toFixed(2) : "–"}
          </span>
        </Stat>
        <Stat label="Table wins">
          <CountUp value={stats.winRate * 100} suffix="%" className="font-display text-4xl text-gold" />
          <span className="text-xs text-muted block mt-1">
            {stats.wins} first-place finish{stats.wins === 1 ? "" : "es"}
          </span>
        </Stat>
        <Stat label="Net result">
          {currencies.length ? (
            currencies.map(([cur, net]) => (
              <div key={cur} className={`font-display text-2xl leading-tight ${net >= 0 ? "text-jade" : "text-seal"}`}>
                <CountUp value={net} signed /> <span className="text-sm text-muted">{cur}</span>
              </div>
            ))
          ) : (
            <span className="font-display text-4xl text-muted">–</span>
          )}
        </Stat>
      </RevealList>

      <div className="grid lg:grid-cols-5 gap-4">
        <Card title="Rating over time" className="lg:col-span-3">
          <RatingTrend history={stats.ratingHistory} />
        </Card>
        <Card title="Finishing position" className="lg:col-span-2">
          <PlacementBars placements={stats.placements} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Stakes played" subtitle="share of games by 底/台 or 底/番 and currency">
          <StakeDonut slices={stats.stakes} total={stats.totalGames} />
          {stats.stakes.length ? (
            <ul className="mt-4 text-xs text-muted grid grid-cols-2 gap-x-4 gap-y-1">
              {stats.stakes.map((s) => (
                <li key={s.label} className="flex justify-between">
                  <span className="font-mono">{s.label}</span>
                  <span className={s.net >= 0 ? "text-jade" : "text-seal"}>{formatMoney(s.net, s.currency)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
        <Card title="Where you play" subtitle="games per venue with net result">
          <VenueBars venues={stats.venues} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="By variant">
          <RevealList className="flex flex-col gap-3">
            {(Object.keys(stats.byVariant) as (keyof typeof stats.byVariant)[]).map((v) => {
              const s = stats.byVariant[v];
              return (
                <div key={v} className="reveal flex justify-between items-baseline">
                  <div>
                    <div>{VARIANT_LABEL[v]}</div>
                    <div className="text-xs text-muted">
                      {s.games} game{s.games === 1 ? "" : "s"} · {s.games ? Math.round((s.wins / s.games) * 100) : 0}% wins
                    </div>
                  </div>
                  <div className={`font-mono ${s.net >= 0 ? "text-jade" : "text-seal"}`}>
                    {s.games ? formatMoney(s.net, s.currency) : "–"}
                  </div>
                </div>
              );
            })}
          </RevealList>
        </Card>
        <Card
          title="Recent games"
          className="lg:col-span-2"
          action={
            isMe ? (
              <Link href="/games" className="text-sm text-jade hover:underline">
                Full history
              </Link>
            ) : null
          }
        >
          {recent.length ? (
            <RevealList className="flex flex-col -mx-4">
              {recent.map((row) => (
                <GameRowItem key={row.id} row={row} />
              ))}
            </RevealList>
          ) : (
            <p className="text-muted text-sm">
              Nothing logged yet.{" "}
              {isMe ? (
                <Link href="/games/new" className="text-jade hover:underline">
                  Log your first table.
                </Link>
              ) : null}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 reveal">
      <div className="text-xs uppercase tracking-wider text-muted mb-2">{label}</div>
      {children}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h2 className="font-display text-lg">{title}</h2>
          {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
