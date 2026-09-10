import Link from "next/link";
import { getDemoStats } from "@/lib/demo-data";
import { PlayerDashboard } from "@/components/player-dashboard";

export const metadata = { title: "Tilebook · sample profile" };

export default function DemoPage() {
  const stats = getDemoStats();
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-line sticky top-0 bg-bg/70 backdrop-blur z-10">
        <nav className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link href="/" className="font-display text-xl text-gold">
            Tilebook
          </Link>
          <span className="text-sm text-muted">Sample profile with made-up games</span>
          <Link href="/" className="btn btn-primary text-sm py-1.5 ml-auto">
            Start your own
          </Link>
        </nav>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-8 flex flex-col gap-6">
        <div>
          <p className="text-muted text-sm">This is what your dashboard looks like</p>
          <h1 className="font-display text-3xl">{stats.player.display_name}</h1>
        </div>
        <PlayerDashboard stats={stats} isMe={false} />
      </main>
    </div>
  );
}
