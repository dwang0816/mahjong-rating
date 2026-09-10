"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Variant } from "@/lib/types";

export interface LogGameState {
  error?: string | null;
}

export async function logGame(_prev: LogGameState, formData: FormData): Promise<LogGameState> {
  const variant = String(formData.get("variant")) as Variant;
  if (variant !== "taiwanese" && variant !== "cantonese") return { error: "Pick a variant." };

  const playedAtRaw = String(formData.get("played_at") ?? "");
  const playedAt = new Date(playedAtRaw);
  if (Number.isNaN(playedAt.getTime())) return { error: "Enter a valid date and time." };

  const stakeBase = Number(formData.get("stake_base"));
  const stakeUnit = Number(formData.get("stake_unit"));
  if (!Number.isInteger(stakeBase) || !Number.isInteger(stakeUnit) || stakeBase < 0 || stakeUnit < 0) {
    return { error: "Stakes must be whole, non-negative numbers." };
  }

  const players = [0, 1, 2, 3].map((i) => ({
    email: String(formData.get(`p${i}_email`) ?? "").trim().toLowerCase(),
    display_name: String(formData.get(`p${i}_name`) ?? "").trim(),
    seat: Number(formData.get(`p${i}_seat`)),
    net_result: Number(formData.get(`p${i}_net`)),
  }));

  for (const p of players) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) return { error: `Invalid email: "${p.email || "(empty)"}".` };
    if (!Number.isFinite(p.net_result)) return { error: `Missing result for ${p.display_name || p.email}.` };
  }
  if (new Set(players.map((p) => p.email)).size !== 4) return { error: "Each player can only sit once." };
  if (new Set(players.map((p) => p.seat)).size !== 4) return { error: "Each seat can only be used once." };
  const sum = players.reduce((s, p) => s + p.net_result, 0);
  if (Math.abs(sum) > 0.005) return { error: `Results must sum to zero (currently ${sum > 0 ? "+" : ""}${sum}).` };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("log_game", {
    p_played_at: playedAt.toISOString(),
    p_variant: variant,
    p_venue_name: String(formData.get("venue_name") ?? ""),
    p_venue_city: String(formData.get("venue_city") ?? ""),
    p_stake_base: stakeBase,
    p_stake_unit: stakeUnit,
    p_currency: String(formData.get("currency") ?? "").toUpperCase().slice(0, 3),
    p_notes: String(formData.get("notes") ?? ""),
    p_players: players,
  });

  if (error) return { error: error.message };
  redirect(`/games/${data}`);
}
