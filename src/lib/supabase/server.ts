import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MISSING_CONFIG_MESSAGE, supabaseEnv } from "@/lib/supabase/env";

export async function createClient() {
  const env = supabaseEnv();
  if (!env) throw new Error(MISSING_CONFIG_MESSAGE);
  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes sessions instead.
        }
      },
    },
  });
}
