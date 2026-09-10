import Link from "next/link";
import { MISSING_CONFIG_MESSAGE, supabaseEnv } from "@/lib/supabase/env";
import { FinishSignIn } from "@/components/finish-sign-in";

export const metadata = { title: "Signing you in · Tilebook" };

/** Magic links land here. The session arrives in the URL fragment, which only the browser can read. */
export default function FinishPage() {
  const env = supabaseEnv();
  return (
    <main className="flex-1 grid place-items-center px-6">
      <div className="card p-8 max-w-md w-full text-center">
        <p className="text-jade font-mono text-xs tracking-widest uppercase mb-3">Tilebook</p>
        {env ? (
          <FinishSignIn url={env.url} anonKey={env.anonKey} />
        ) : (
          <p className="text-seal text-sm">{MISSING_CONFIG_MESSAGE}</p>
        )}
        <Link href="/" className="block mt-6 text-sm text-muted hover:text-ivory">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
