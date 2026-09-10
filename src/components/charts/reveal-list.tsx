"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, stagger } from "animejs";

/** Wraps a list of children and staggers them in with anime.js. Children are direct DOM children. */
export function RevealList({ children, className, step = 60 }: { children: ReactNode; className?: string; step?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const a = animate(ref.current.children, {
      opacity: [0, 1],
      translateY: [10, 0],
      delay: stagger(step),
      duration: 450,
      ease: "outCubic",
    });
    return () => {
      a.revert();
    };
  }, [step]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
