import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link landing route. Supports both Supabase link styles:
 *  - PKCE:        /auth/callback?code=...            (default email template)
 *  - Token hash:  /auth/callback?token_hash=...&type=magiclink  (SSR-friendly template)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextPath = safeNext(searchParams.get("next"));

  const supabase = await createClient();
  let error: string | null = null;

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error?.message ?? null;
  } else if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    error = result.error?.message ?? null;
  } else {
    error = "Missing sign-in token";
  }

  if (error) {
    const url = new URL("/", origin);
    url.searchParams.set("error", error);
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}
