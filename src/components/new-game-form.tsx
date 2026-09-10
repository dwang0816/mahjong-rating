"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { logGame, type LogGameState } from "@/app/actions/games";
import { SEAT_LABEL, STAKE_UNIT_LABEL, type Variant, type Venue } from "@/lib/types";

interface Props {
  me: { email: string; display_name: string };
  venues: Venue[];
  knownPlayers: { email: string; display_name: string }[];
}

const PRESETS: Record<Variant, { base: number; unit: number; currency: string; label: string }[]> = {
  taiwanese: [
    { base: 50, unit: 10, currency: "TWD", label: "50/10 casual" },
    { base: 100, unit: 20, currency: "TWD", label: "100/20" },
    { base: 300, unit: 100, currency: "TWD", label: "300/100" },
    { base: 500, unit: 200, currency: "TWD", label: "500/200" },
  ],
  cantonese: [
    { base: 1, unit: 2, currency: "HKD", label: "1/2 friendly" },
    { base: 5, unit: 10, currency: "HKD", label: "5/10" },
    { base: 10, unit: 20, currency: "HKD", label: "10/20" },
    { base: 50, unit: 100, currency: "HKD", label: "50/100" },
  ],
};

function localDateTimeNow() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function NewGameForm({ me, venues, knownPlayers }: Props) {
  const [state, formAction, pending] = useActionState<LogGameState, FormData>(logGame, {});
  const [variant, setVariant] = useState<Variant>("taiwanese");
  const [stake, setStake] = useState({ base: 100, unit: 20, currency: "TWD" });
  const [nets, setNets] = useState<string[]>(["", "", "", ""]);
  const formRef = useRef<HTMLFormElement>(null);
  const sumRef = useRef<HTMLSpanElement>(null);

  const sum = useMemo(() => nets.reduce((s, n) => s + (Number(n) || 0), 0), [nets]);
  const balanced = Math.abs(sum) < 0.005 && nets.every((n) => n !== "");

  useEffect(() => {
    if (!formRef.current) return;
    const a = animate(formRef.current.querySelectorAll("fieldset"), {
      opacity: [0, 1],
      translateY: [12, 0],
      delay: stagger(90),
      duration: 450,
      ease: "outCubic",
    });
    return () => {
      a.revert();
    };
  }, []);

  useEffect(() => {
    if (!sumRef.current) return;
    const a = animate(sumRef.current, { scale: [1.25, 1], duration: 350, ease: "outBack" });
    return () => {
      a.revert();
    };
  }, [sum]);

  useEffect(() => {
    if (!state.error || !formRef.current) return;
    const a = animate(formRef.current, { translateX: [0, -6, 6, -4, 4, 0], duration: 400, ease: "linear" });
    return () => {
      a.revert();
    };
  }, [state]);

  const unitLabel = STAKE_UNIT_LABEL[variant];

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      <fieldset className="card p-5 grid sm:grid-cols-2 gap-4 reveal">
        <legend className="sr-only">When and where</legend>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Date and time</span>
          <input name="played_at" type="datetime-local" required defaultValue={localDateTimeNow()} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Variant</span>
          <select
            name="variant"
            value={variant}
            onChange={(e) => {
              const v = e.target.value as Variant;
              setVariant(v);
              const p = PRESETS[v][1];
              setStake({ base: p.base, unit: p.unit, currency: p.currency });
            }}
            className="input"
          >
            <option value="taiwanese">Taiwanese 16-tile 台灣麻將</option>
            <option value="cantonese">Cantonese 13-tile 廣東麻雀</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Venue</span>
          <input name="venue_name" list="venues" placeholder="Ah-Ma's living room" className="input" />
          <datalist id="venues">
            {venues.map((v) => (
              <option key={v.id} value={v.name} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">City</span>
          <input name="venue_city" placeholder="Taipei" className="input" />
        </label>
      </fieldset>

      <fieldset className="card p-5 reveal">
        <legend className="sr-only">Stakes</legend>
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS[variant].map((p) => {
            const active = p.base === stake.base && p.unit === stake.unit;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setStake({ base: p.base, unit: p.unit, currency: p.currency })}
                className={`btn text-sm py-1.5 ${active ? "btn-primary" : "btn-ghost"}`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">{unitLabel.base}</span>
            <input
              name="stake_base"
              type="number"
              min={0}
              required
              value={stake.base}
              onChange={(e) => setStake({ ...stake, base: Number(e.target.value) })}
              className="input font-mono"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">{unitLabel.unit}</span>
            <input
              name="stake_unit"
              type="number"
              min={0}
              required
              value={stake.unit}
              onChange={(e) => setStake({ ...stake, unit: Number(e.target.value) })}
              className="input font-mono"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Currency</span>
            <input
              name="currency"
              maxLength={3}
              required
              value={stake.currency}
              onChange={(e) => setStake({ ...stake, currency: e.target.value.toUpperCase() })}
              className="input font-mono uppercase"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="card p-5 reveal">
        <legend className="sr-only">Players</legend>
        <div className="hidden sm:grid grid-cols-[1fr_1fr_8rem_8rem] gap-3 text-xs text-muted mb-2 px-1">
          <span>Email</span>
          <span>Name</span>
          <span>Seat</span>
          <span>Net result</span>
        </div>
        <datalist id="known-players">
          {knownPlayers.map((p) => (
            <option key={p.email} value={p.email}>
              {p.display_name}
            </option>
          ))}
        </datalist>
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_1fr_8rem_8rem] gap-3">
              <input
                name={`p${i}_email`}
                type="email"
                required
                list="known-players"
                placeholder="player@email.com"
                defaultValue={i === 0 ? me.email : ""}
                readOnly={i === 0}
                className={`input ${i === 0 ? "opacity-70" : ""}`}
              />
              <input
                name={`p${i}_name`}
                placeholder="Display name"
                defaultValue={i === 0 ? me.display_name : ""}
                className="input"
              />
              <select name={`p${i}_seat`} defaultValue={i} className="input">
                {SEAT_LABEL.map((s, idx) => (
                  <option key={s} value={idx}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                name={`p${i}_net`}
                type="number"
                step="any"
                required
                placeholder="+1240"
                value={nets[i]}
                onChange={(e) => setNets(nets.map((n, idx) => (idx === i ? e.target.value : n)))}
                className={`input font-mono ${Number(nets[i]) > 0 ? "text-jade" : Number(nets[i]) < 0 ? "text-seal" : ""}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">Money is zero-sum: results must add up to 0.</span>
          <span className={`font-mono ${balanced ? "text-jade" : "text-gold"}`}>
            sum <span ref={sumRef} className="inline-block">{sum > 0 ? "+" : ""}{sum.toLocaleString()}</span>{" "}
            {stake.currency}
          </span>
        </div>
      </fieldset>

      <fieldset className="card p-5 reveal">
        <legend className="sr-only">Notes</legend>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Notes (optional)</span>
          <textarea name="notes" rows={2} placeholder="Big hands, rule tweaks, who dealt in…" className="input" />
        </label>
      </fieldset>

      {state.error ? <p className="text-seal text-sm">{state.error}</p> : null}
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={pending || !balanced}>
          {pending ? "Saving…" : "Save game and update ratings"}
        </button>
      </div>
    </form>
  );
}
