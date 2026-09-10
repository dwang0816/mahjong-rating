"use server";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export interface MagicLinkState {
  sent?: boolean;
  email?: string;
  error?: string | null;
}

export async function sendMagicLink(_prev: MagicLinkState, formData: FormData): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = String(formData.get("next") ?? "/dashboard");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const site = await getSiteUrl();
  const redirect = new URL("/auth/callback", site);
  if (next.startsWith("/") && !next.startsWith("//")) redirect.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirect.toString(), shouldCreateUser: true },
  });

  if (error) return { error: error.message };
  return { sent: true, email };
}
