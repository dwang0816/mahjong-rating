import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { LandingTiles } from "@/components/landing-tiles";
import { supabaseEnv, supabaseEnvReport } from "@/lib/supabase/env";

/** Shown instead of the sign-in form when the deployment has no Supabase settings. Names only, never values. */
function ConfigHelp() {
  const r = supabaseEnvReport();
  return (
    <div className="card p-6 max-w-md border-seal/50 text-sm">
      <p className="text-seal font-semibold text-base">Deployment not configured</p>
      <p className="text-muted mt-2">
        The server needs a Supabase project URL and a public key. Add them as environment variables, then
        redeploy (Vercel only applies env changes to new deployments).
      </p>
      <dl className="mt-4 grid grid-cols-[5rem_1fr] gap-y-2 gap-x-3">
        <dt className="text-muted">URL</dt>
        <dd className="font-mono break-all">
          {r.urlName ? <span className="text-jade">found as {r.urlName}</span> : <span className="text-seal">missing</span>}
          <span className="block text-muted text-xs mt-0.5">accepts {r.urlOptions.join(", ")}</span>
        </dd>
        <dt className="text-muted">Key</dt>
        <dd className="font-mono break-all">
          {r.keyName ? <span className="text-jade">found as {r.keyName}</span> : <span className="text-seal">missing</span>}
          <span className="block text-muted text-xs mt-0.5">accepts {r.keyOptions.join(", ")}</span>
        </dd>
        <dt className="text-muted">Seen</dt>
        <dd className="font-mono text-xs break-all text-muted">
          {r.present.length ? r.present.join(", ") : "no SUPABASE_* or POSTGRES_* variables at all"}
        </dd>
      </dl>
      <p className="text-muted text-xs mt-4">
        If the integration added a prefix (e.g. STORAGE_NEXT_PUBLIC_SUPABASE_URL), set SUPABASE_ENV_PREFIX=STORAGE.
      </p>
    </div>
  );
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const next = typeof params.next === "string" ? params.next : "/dashboard";

  return (
    <main className="flex-1 grid lg:grid-cols-2">
      <section className="flex flex-col justify-center px-8 py-16 lg:px-20 gap-8">
        <div>
          <p className="text-jade font-mono text-sm tracking-widest uppercase">Tilebook</p>
          <h1 className="font-display text-5xl lg:text-6xl leading-[1.05] mt-3">
            Your mahjong record,
            <br />
            <span className="text-gold">table by table.</span>
          </h1>
          <p className="text-muted mt-5 max-w-md text-lg">
            Log every Taiwanese and Cantonese game you play, watch your rating move, see which
            stakes and venues pay, and find out who you should be sitting with.
          </p>
        </div>
        {supabaseEnv() ? (
          <LoginForm initialError={error} next={next} />
        ) : (
          <ConfigHelp />
        )}
        <Link href="/demo" className="text-sm text-jade hover:underline -mt-4">
          See a sample profile first →
        </Link>
        <ul className="text-sm text-muted grid grid-cols-3 gap-4 max-w-md">
          <li>
            <span className="text-ivory font-semibold block">Elo rating</span>
            adjusted by who you beat
          </li>
          <li>
            <span className="text-ivory font-semibold block">Stakes and venues</span>
            where and how big you play
          </li>
          <li>
            <span className="text-ivory font-semibold block">Head to head</span>
            records against every opponent
          </li>
        </ul>
      </section>
      <section className="hidden lg:flex items-center justify-center bg-bg-2 border-l border-line relative overflow-hidden">
        <LandingTiles />
      </section>
    </main>
  );
}
