import { createClient } from "@/lib/supabase/server";
import type { Game, GamePlayer, Player, Variant } from "@/lib/types";
import { stakeLabel } from "@/lib/types";

export type GameRow = GamePlayer & { game: Game };

export interface Slice {
  label: string;
  count: number;
  net: number;
  currency: string;
}

export interface VenueStat {
  name: string;
  city: string | null;
  games: number;
  net: number;
  currency: string;
  wins: number;
}

export interface RatingPoint {
  date: string;
  /** Preformatted on the server so client charts never format dates (avoids hydration mismatches). */
  shortLabel: string;
  longLabel: string;
  rating: number;
  gameId: string;
}

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const longDate = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

function ratingPoint(date: string, rating: number, gameId: string): RatingPoint {
  const d = new Date(date);
  return { date, shortLabel: shortDate.format(d), longLabel: longDate.format(d), rating, gameId };
}

export interface PlayerStats {
  player: Player;
  games: GameRow[];
  totalGames: number;
  wins: number;
  winRate: number;
  avgPlacement: number;
  netByCurrency: Record<string, number>;
  stakes: Slice[];
  venues: VenueStat[];
  ratingHistory: RatingPoint[];
  byVariant: Record<Variant, { games: number; wins: number; net: number; currency: string }>;
  placements: number[]; // index 0 = 1st place count ... index 3 = 4th
}

export async function getCurrentPlayer(): Promise<Player | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("players").select("*").eq("profile_id", user.id).maybeSingle();
  return (data as Player | null) ?? null;
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("players").select("*").eq("id", id).maybeSingle();
  return (data as Player | null) ?? null;
}

export async function getPlayerGames(playerId: string): Promise<GameRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_players")
    .select("*, game:games(*, venue:venues(*))")
    .eq("player_id", playerId);
  if (error) throw error;
  const rows = (data ?? []) as unknown as GameRow[];
  return rows
    .map((r) => ({ ...r, net_result: Number(r.net_result), rating_before: Number(r.rating_before), rating_after: Number(r.rating_after) }))
    .sort((a, b) => new Date(a.game.played_at).getTime() - new Date(b.game.played_at).getTime());
}

export async function getPlayerStats(player: Player): Promise<PlayerStats> {
  const games = await getPlayerGames(player.id);
  return computeStats(player, games);
}

export function computeStats(player: Player, games: GameRow[]): PlayerStats {
  const totalGames = games.length;
  const wins = games.filter((g) => g.placement === 1).length;
  const placements = [0, 0, 0, 0];
  const netByCurrency: Record<string, number> = {};
  const stakeMap = new Map<string, Slice>();
  const venueMap = new Map<string, VenueStat>();
  const byVariant: PlayerStats["byVariant"] = {
    taiwanese: { games: 0, wins: 0, net: 0, currency: "TWD" },
    cantonese: { games: 0, wins: 0, net: 0, currency: "HKD" },
  };

  for (const row of games) {
    const g = row.game;
    placements[row.placement - 1] += 1;
    netByCurrency[g.currency] = (netByCurrency[g.currency] ?? 0) + row.net_result;

    const label = stakeLabel(g);
    const slice = stakeMap.get(label) ?? { label, count: 0, net: 0, currency: g.currency };
    slice.count += 1;
    slice.net += row.net_result;
    stakeMap.set(label, slice);

    const venueName = g.venue?.name ?? "Unknown venue";
    const venueKey = `${venueName}|${g.venue?.city ?? ""}`;
    const venue = venueMap.get(venueKey) ?? {
      name: venueName,
      city: g.venue?.city ?? null,
      games: 0,
      net: 0,
      currency: g.currency,
      wins: 0,
    };
    venue.games += 1;
    venue.net += row.net_result;
    if (row.placement === 1) venue.wins += 1;
    venueMap.set(venueKey, venue);

    const v = byVariant[g.variant];
    v.games += 1;
    v.net += row.net_result;
    v.currency = g.currency;
    if (row.placement === 1) v.wins += 1;
  }

  const ratingHistory: RatingPoint[] = games.map((row) => ratingPoint(row.game.played_at, row.rating_after, row.game_id));
  if (games.length) {
    ratingHistory.unshift(ratingPoint(games[0].game.played_at, games[0].rating_before, "start"));
  }

  const avgPlacement = totalGames ? games.reduce((s, g) => s + g.placement, 0) / totalGames : 0;

  return {
    player,
    games,
    totalGames,
    wins,
    winRate: totalGames ? wins / totalGames : 0,
    avgPlacement,
    netByCurrency,
    stakes: [...stakeMap.values()].sort((a, b) => b.count - a.count),
    venues: [...venueMap.values()].sort((a, b) => b.games - a.games),
    ratingHistory,
    byVariant,
    placements,
  };
}

/** Opponent summary from the perspective of `me`. */
export interface OpponentSummary {
  player: Pick<Player, "id" | "display_name" | "rating" | "games_played" | "profile_id">;
  sharedGames: number;
  myWinsVsThem: number; // games where I finished above them
  theirWinsVsMe: number;
  netVsThem: Record<string, number>; // my net in games with them, by currency
  sharedStakes: string[];
  sharedVenues: string[];
  ratingGap: number;
  lastPlayed: string | null;
}

export async function getOpponents(me: Player): Promise<OpponentSummary[]> {
  const supabase = await createClient();
  const myGames = await getPlayerGames(me.id);
  if (!myGames.length) return [];

  const gameIds = myGames.map((g) => g.game_id);
  const { data, error } = await supabase
    .from("game_players")
    .select("*, player:players(id, display_name, rating, games_played, profile_id)")
    .in("game_id", gameIds)
    .neq("player_id", me.id);
  if (error) throw error;

  const mine = new Map(myGames.map((g) => [g.game_id, g]));
  const map = new Map<string, OpponentSummary>();

  for (const raw of (data ?? []) as unknown as (GamePlayer & { player: OpponentSummary["player"] })[]) {
    const myRow = mine.get(raw.game_id);
    if (!myRow) continue;
    const g = myRow.game;
    const entry = map.get(raw.player_id) ?? {
      player: { ...raw.player, rating: Number(raw.player.rating) },
      sharedGames: 0,
      myWinsVsThem: 0,
      theirWinsVsMe: 0,
      netVsThem: {},
      sharedStakes: [],
      sharedVenues: [],
      ratingGap: Number(raw.player.rating) - me.rating,
      lastPlayed: null,
    };
    entry.sharedGames += 1;
    if (myRow.placement < raw.placement) entry.myWinsVsThem += 1;
    else if (myRow.placement > raw.placement) entry.theirWinsVsMe += 1;
    entry.netVsThem[g.currency] = (entry.netVsThem[g.currency] ?? 0) + myRow.net_result;
    const stake = stakeLabel(g);
    if (!entry.sharedStakes.includes(stake)) entry.sharedStakes.push(stake);
    const venue = g.venue?.name;
    if (venue && !entry.sharedVenues.includes(venue)) entry.sharedVenues.push(venue);
    if (!entry.lastPlayed || new Date(g.played_at) > new Date(entry.lastPlayed)) entry.lastPlayed = g.played_at;
    map.set(raw.player_id, entry);
  }

  return [...map.values()].sort((a, b) => b.sharedGames - a.sharedGames);
}

export async function getAllPlayers(): Promise<Player[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("rating", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Player[]).map((p) => ({ ...p, rating: Number(p.rating), peak_rating: Number(p.peak_rating) }));
}

export async function getGame(id: string): Promise<{ game: Game; seats: GamePlayer[] } | null> {
  const supabase = await createClient();
  const { data: game } = await supabase
    .from("games")
    .select("*, venue:venues(*)")
    .eq("id", id)
    .maybeSingle();
  if (!game) return null;
  const { data: seats } = await supabase
    .from("game_players")
    .select("*, player:players(id, display_name, email, rating)")
    .eq("game_id", id)
    .order("placement", { ascending: true });
  return {
    game: game as unknown as Game,
    seats: ((seats ?? []) as unknown as GamePlayer[]).map((s) => ({
      ...s,
      net_result: Number(s.net_result),
      rating_before: Number(s.rating_before),
      rating_after: Number(s.rating_after),
    })),
  };
}
