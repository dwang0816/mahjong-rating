"use client";

import { useEffect, useRef } from "react";
import { animate, utils } from "animejs";

interface Props {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  signed?: boolean;
  duration?: number;
}

/** Number that ticks up from zero when it mounts. */
export function CountUp({ value, decimals = 0, prefix = "", suffix = "", className, signed, duration = 1400 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const counter = { v: 0 };
    const format = (v: number) => {
      const sign = signed ? (v > 0 ? "+" : v < 0 ? "-" : "") : v < 0 ? "-" : "";
      return `${sign}${prefix}${Math.abs(v).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;
    };
    el.textContent = format(0);
    const anim = animate(counter, {
      v: value,
      duration,
      ease: "outExpo",
      modifier: utils.round(decimals),
      onUpdate: () => {
        el.textContent = format(counter.v);
      },
    });
    return () => {
      anim.revert();
    };
  }, [value, decimals, prefix, suffix, signed, duration]);

  return <span ref={ref} className={className} />;
}
