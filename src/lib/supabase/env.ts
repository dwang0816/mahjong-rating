/**
 * Reads the Supabase connection settings on the server.
 *
 * Accepts the names Vercel's Supabase integration and newer Supabase projects use, so the deployment
 * works whether you pasted an anon key by hand or let the integration inject a publishable key.
 * An optional SUPABASE_ENV_PREFIX (e.g. "STORAGE") is honoured for prefixed integration variables.
 */
const URL_NAMES = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"];
const KEY_NAMES = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
];

function candidates(names: string[]) {
  const prefix = process.env.SUPABASE_ENV_PREFIX?.replace(/_+$/, "");
  return prefix ? [...names, ...names.map((n) => `${prefix}_${n}`)] : names;
}

function firstSet(names: string[]): { name: string; value: string } | null {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return { name, value };
  }
  return null;
}

export function supabaseEnv(): { url: string; anonKey: string } | null {
  const url = firstSet(candidates(URL_NAMES));
  const key = firstSet(candidates(KEY_NAMES));
  if (!url || !key) return null;
  return { url: url.value, anonKey: key.value };
}

/** Names-only diagnostic for the "not configured" screen. Never exposes values. */
export function supabaseEnvReport() {
  const url = firstSet(candidates(URL_NAMES));
  const key = firstSet(candidates(KEY_NAMES));
  const present = Object.keys(process.env).filter((n) => /SUPABASE|POSTGRES/i.test(n)).sort();
  return {
    urlName: url?.name ?? null,
    keyName: key?.name ?? null,
    urlOptions: URL_NAMES,
    keyOptions: KEY_NAMES,
    present,
  };
}

export const MISSING_CONFIG_MESSAGE =
  "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or a publishable key) in the environment and redeploy.";
