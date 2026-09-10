"use server";

import { createClient } from "@/lib/supabase/server";
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

  if (!supabaseEnv()) return { error: MISSING_CONFIG_MESSAGE };

  // Implicit flow: the emailed link lands on /auth/finish with the session in the URL fragment.
  // Unlike PKCE it does not depend on a cookie from the browser that requested the link, so the
  // link can be opened from a phone, a mail client's in-app browser, or another computer.
  const supabase = await createClient({ flowType: "implicit" });
  const site = await getSiteUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${site}/auth/finish`, shouldCreateUser: true },
  });

  if (error) return { error: error.message };
  return { sent: true, email };
}
