import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MISSING_CONFIG_MESSAGE, supabaseEnv } from "@/lib/supabase/env";

interface Options {
  /**
   * "implicit" makes magic links carry the session in the URL fragment, so the link works from any
   * browser or device. "pkce" (the default) ties the link to the browser that requested it.
   */
  flowType?: "pkce" | "implicit";
}

export async function createClient(options: Options = {}) {
  const env = supabaseEnv();
  if (!env) throw new Error(MISSING_CONFIG_MESSAGE);
  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    auth: options.flowType ? { flowType: options.flowType } : undefined,
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
