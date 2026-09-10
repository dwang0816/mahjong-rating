"use server";

import { createClient as createPlainClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/site-url";
import { MISSING_CONFIG_MESSAGE, supabaseEnv } from "@/lib/supabase/env";

export interface MagicLinkState {
  sent?: boolean;
  email?: string;
  error?: string | null;
}

export async function sendMagicLink(_prev: MagicLinkState, formData: FormData): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const env = supabaseEnv();
  if (!env) return { error: MISSING_CONFIG_MESSAGE };

  // Implicit flow: the emailed link lands on /auth/finish with the session in the URL fragment, so it
  // works from any browser or device. @supabase/ssr forces PKCE (which ties the link to the browser
  // that requested it), so the request goes through the plain supabase-js client. No cookies needed
  // just to send an email.
  const supabase = createPlainClient(env.url, env.anonKey, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const site = await getSiteUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${site}/auth/finish`, shouldCreateUser: true },
  });

  if (error) return { error: error.message };
  return { sent: true, email };
}
