import { computeStats, type GameRow } from "@/lib/data";
import type { Player, Variant } from "@/lib/types";

/** Sample profile used by /demo so visitors can see the dashboard before signing up. */
const player: Player = {
  id: "demo",
  profile_id: "demo",
  email: "demo@tilebook.app",
  display_name: "Demo Player",
  rating: 1538.4,
  peak_rating: 1551.2,
  games_played: 11,
  created_at: new Date().toISOString(),
};

type Spec = [daysAgo: number, variant: Variant, venue: string, city: string, base: number, unit: number, cur: string, net: number, place: number, before: number, after: number];

const specs: Spec[] = [
  [90, "taiwanese", "Ah-Ma's Living Room", "Taipei", 100, 20, "TWD", 1240, 1, 1500, 1516],
  [83, "taiwanese", "Ah-Ma's Living Room", "Taipei", 100, 20, "TWD", -560, 3, 1516, 1506.3],
  [76, "taiwanese", "Ah-Ma's Living Room", "Taipei", 100, 20, "TWD", 300, 2, 1506.3, 1511.1],
  [70, "taiwanese", "Jade Dragon Parlour", "Taichung", 300, 100, "TWD", -2400, 4, 1511.1, 1495.4],
  [63, "taiwanese", "Jade Dragon Parlour", "Taichung", 300, 100, "TWD", 3300, 1, 1495.4, 1512.6],
  [55, "cantonese", "Golden Phoenix Mahjong School", "Hong Kong", 5, 10, "HKD", 640, 1, 1512.6, 1528.2],
  [48, "cantonese", "Golden Phoenix Mahjong School", "Hong Kong", 5, 10, "HKD", -480, 4, 1528.2, 1512.0],
  [41, "cantonese", "Uncle Lam's Flat", "Hong Kong", 10, 20, "HKD", 2560, 1, 1512.0, 1527.9],
  [30, "taiwanese", "Ah-Ma's Living Room", "Taipei", 100, 20, "TWD", 820, 1, 1527.9, 1541.5],
  [16, "taiwanese", "Jade Dragon Parlour", "Taichung", 300, 100, "TWD", -1700, 4, 1541.5, 1524.8],
  [5, "taiwanese", "Ah-Ma's Living Room", "Taipei", 100, 20, "TWD", 1160, 1, 1524.8, 1538.4],
];

const games: GameRow[] = specs.map(([daysAgo, variant, venue, city, base, unit, cur, net, place, before, after], i) => {
  const id = `demo-${i}`;
  return {
    id,
    game_id: id,
    player_id: player.id,
    seat: i % 4,
    net_result: net,
    placement: place,
    rating_before: before,
    rating_after: after,
    game: {
      id,
      played_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      variant,
      venue_id: venue,
      stake_base: base,
      stake_unit: unit,
      currency: cur,
      notes: null,
      logged_by: player.id,
      venue: { id: venue, name: venue, city },
    },
  };
});

export function getDemoStats() {
  return computeStats(player, games);
}
