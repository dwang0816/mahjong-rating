"use client";

import { useEffect, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { animate } from "animejs";

/**
 * Reads the session out of the magic link's URL fragment, stores it in cookies (so the server can see
 * it), then sends the player to the dashboard with a full navigation.
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

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const linkError = hash.get("error_description") ?? hash.get("error");
    if (linkError) {
      fail(linkError.replace(/\+/g, " "));
      return;
    }
    if (!hash.get("access_token")) {
      fail("This link is missing its sign-in token. Request a new one.");
      return;
    }

    const supabase = createBrowserClient(url, anonKey, { auth: { flowType: "implicit" } });
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      window.history.replaceState(null, "", window.location.pathname);
      window.location.replace("/dashboard");
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish();
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish();
    });

    const timer = window.setTimeout(() => {
      if (!done) fail("The link could not be verified. It may have expired or already been used.");
    }, 10000);

    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
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
