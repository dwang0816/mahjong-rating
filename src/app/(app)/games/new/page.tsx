import { redirect } from "next/navigation";
import { getCurrentPlayer } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { NewGameForm } from "@/components/new-game-form";
import type { Venue } from "@/lib/types";

export default async function NewGamePage() {
  const me = await getCurrentPlayer();
  if (!me) redirect("/");
  const supabase = await createClient();
  const [{ data: venues }, { data: players }] = await Promise.all([
    supabase.from("venues").select("id, name, city").order("name"),
    supabase.from("players").select("email, display_name").order("display_name"),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <p className="text-muted text-sm">New table</p>
        <h1 className="font-display text-3xl">Log a game</h1>
        <p className="text-muted mt-1">
          Enter all four seats. Players who have not signed up yet get a profile automatically and see the
          game when they join with the same email.
        </p>
      </div>
      <NewGameForm
        me={{ email: me.email, display_name: me.display_name }}
        venues={(venues ?? []) as Venue[]}
        knownPlayers={(players ?? []) as { email: string; display_name: string }[]}
      />
    </div>
  );
}
