import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPlayer } from "@/lib/data";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const me = await getCurrentPlayer();
  if (!me) redirect("/");

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-line bg-bg/70 backdrop-blur sticky top-0 z-10">
        <nav className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-6">
          <Link href="/dashboard" className="font-display text-xl text-gold">
            Tilebook
          </Link>
          <div className="flex gap-4 text-sm text-muted">
            <Link href="/dashboard" className="hover:text-ivory">
              Dashboard
            </Link>
            <Link href="/games" className="hover:text-ivory">
              History
            </Link>
            <Link href="/players" className="hover:text-ivory">
              Players
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/games/new" className="btn btn-primary text-sm py-1.5">
              + Log a game
            </Link>
            <Link href="/profile" className="text-sm text-muted hover:text-ivory">
              {me.display_name}{" "}
              <span className="font-mono text-jade">{Math.round(Number(me.rating))}</span>
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-muted hover:text-ivory">Sign out</button>
            </form>
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
