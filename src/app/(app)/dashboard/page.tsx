import { redirect } from "next/navigation";
import { getCurrentPlayer, getPlayerStats } from "@/lib/data";
import { PlayerDashboard } from "@/components/player-dashboard";

export default async function DashboardPage() {
  const me = await getCurrentPlayer();
  if (!me) redirect("/");
  const stats = await getPlayerStats(me);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-muted text-sm">Welcome back</p>
        <h1 className="font-display text-3xl">{me.display_name}</h1>
      </div>
      <PlayerDashboard stats={stats} isMe />
    </div>
  );
}
