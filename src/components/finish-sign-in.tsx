"use client";

import { useEffect, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { animate } from "animejs";

/**
 * Magic links land here with `#access_token=…&refresh_token=…` in the URL fragment. The fragment never
 * reaches the server, so this component stores the session in cookies (via the ssr browser client)
 * and then does a full navigation to the dashboard so the server sees it.
 */
export function FinishSignIn({ url, anonKey }: { url: string; anonKey: string }) {
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState("Signing you in…");
  const tileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tileRef.current) return;
    const a = animate(tileRef.current, { rotate: [0, 360], duration: 1600, loop: true, ease: "inOutSine" });
    return () => {
      a.revert();
    };
  }, []);

  useEffect(() => {
    const fail = (msg: string) =>
      queueMicrotask(() => {
        setStatus("error");
        setMessage(msg);
      });

    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    // Old-style PKCE link (or a link generated before this deploy): let the callback route try it.
    if (query.get("code") || query.get("token_hash")) {
      window.location.replace(`/auth/callback${window.location.search}`);
      return;
    }

    const linkError = hash.get("error_description") ?? hash.get("error");
    if (linkError) {
      fail(linkError.replace(/\+/g, " "));
      return;
    }

    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    if (!accessToken || !refreshToken) {
      fail("This link is missing its sign-in token. Request a new one.");
      return;
    }

    let cancelled = false;
    const supabase = createBrowserClient(url, anonKey, { auth: { detectSessionInUrl: false } });
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data.session) {
          fail(error?.message ?? "The link could not be verified. It may have expired or already been used.");
          return;
        }
        window.history.replaceState(null, "", window.location.pathname);
        window.location.replace("/dashboard");
      });

    return () => {
      cancelled = true;
    };
  }, [url, anonKey]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={tileRef} className={`tile w-12 h-16 text-2xl ${status === "error" ? "text-seal" : "text-jade-deep"}`}>
        {status === "error" ? "✕" : "中"}
      </div>
      <p className={status === "error" ? "text-seal" : "text-ivory"}>{message}</p>
    </div>
  );
}
