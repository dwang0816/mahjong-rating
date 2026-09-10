"use client";

import { useActionState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { sendMagicLink, type MagicLinkState } from "@/app/actions/auth";

export function LoginForm({ initialError, next }: { initialError: string | null; next: string }) {
  const [state, formAction, pending] = useActionState<MagicLinkState, FormData>(sendMagicLink, {
    error: initialError,
  });
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!boxRef.current) return;
    animate(boxRef.current, { opacity: [0, 1], translateY: [12, 0], duration: 500, ease: "outCubic" });
  }, [state.sent]);

  if (state.sent) {
    return (
      <div ref={boxRef} className="card p-6 max-w-md">
        <p className="text-jade font-semibold">Check your inbox</p>
        <p className="text-muted mt-2">
          We sent a sign-in link to <span className="text-ivory">{state.email}</span>. Open it on any
          device to land on your dashboard. The link only works for that address and expires after one use.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} ref={boxRef as never} className="card p-6 max-w-md flex flex-col gap-3">
      <label htmlFor="email" className="text-sm text-muted">
        Sign in or create your profile with your email
      </label>
      <div className="flex gap-2">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="input"
        />
        <input type="hidden" name="next" value={next} />
        <button className="btn btn-primary whitespace-nowrap" disabled={pending}>
          {pending ? "Sending…" : "Send magic link"}
        </button>
      </div>
      {state.error ? <p className="text-seal text-sm">{state.error}</p> : null}
      <p className="text-xs text-muted">No passwords. The link expires after one use.</p>
    </form>
  );
}
