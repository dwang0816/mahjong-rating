export type Variant = "taiwanese" | "cantonese";

export interface Player {
  id: string;
  profile_id: string | null;
  email: string;
  display_name: string;
  rating: number;
  peak_rating: number;
  games_played: number;
  created_at: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string | null;
}

export interface Game {
  id: string;
  played_at: string;
  variant: Variant;
  venue_id: string | null;
  stake_base: number;
  stake_unit: number;
  currency: string;
  notes: string | null;
  logged_by: string | null;
  venue?: Venue | null;
}

export interface GamePlayer {
  id: string;
  game_id: string;
  player_id: string;
  seat: number;
  net_result: number;
  placement: number;
  rating_before: number;
  rating_after: number;
  player?: Pick<Player, "id" | "display_name" | "email" | "rating">;
  game?: Game;
}

export const VARIANT_LABEL: Record<Variant, string> = {
  taiwanese: "Taiwanese 16-tile",
  cantonese: "Cantonese 13-tile",
};

/** 底/台 for Taiwanese, 底/番 for Cantonese */
export const STAKE_UNIT_LABEL: Record<Variant, { base: string; unit: string }> = {
  taiwanese: { base: "底 base", unit: "台 per tai" },
  cantonese: { base: "底 base", unit: "番 per faan" },
};

export const SEAT_LABEL = ["East 東", "South 南", "West 西", "North 北"];

export function stakeLabel(game: Pick<Game, "variant" | "stake_base" | "stake_unit" | "currency">) {
  return `${game.stake_base}/${game.stake_unit} ${game.currency}`;
}

export function formatMoney(value: number, currency: string) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toLocaleString()} ${currency}`;
}
