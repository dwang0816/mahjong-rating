import { redirect } from "next/navigation";
import { getCurrentPlayer } from "@/lib/data";
import { updateDisplayName } from "@/app/actions/profile";

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const me = await getCurrentPlayer();
  if (!me) redirect("/");
  const params = await searchParams;
  const saved = params.saved === "1";
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <p className="text-muted text-sm">Account</p>
        <h1 className="font-display text-3xl">Your profile</h1>
      </div>
      <form action={updateDisplayName} className="card p-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Email (sign-in address, cannot change)</span>
          <input value={me.email} readOnly className="input opacity-70" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Display name</span>
          <input name="display_name" defaultValue={me.display_name} maxLength={40} required className="input" />
        </label>
        <div className="grid grid-cols-3 text-sm">
          <div>
            <div className="text-muted text-xs">Rating</div>
            <div className="font-mono text-jade">{Math.round(Number(me.rating))}</div>
          </div>
          <div>
            <div className="text-muted text-xs">Peak</div>
            <div className="font-mono">{Math.round(Number(me.peak_rating))}</div>
          </div>
          <div>
            <div className="text-muted text-xs">Games</div>
            <div className="font-mono">{me.games_played}</div>
          </div>
        </div>
        {saved ? <p className="text-jade text-sm">Saved.</p> : null}
        {error ? <p className="text-seal text-sm">{error}</p> : null}
        <div className="flex justify-end">
          <button className="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  );
}
