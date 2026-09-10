"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

const TILES = ["東", "南", "西", "北", "中", "發", "白", "一", "五", "九", "筒", "條", "萬"];

export function LandingTiles() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tiles = ref.current.querySelectorAll<HTMLElement>(".tile");
    const intro = animate(tiles, {
      opacity: [0, 1],
      translateY: [40, 0],
      rotate: () => `${(Math.random() - 0.5) * 12}deg`,
      delay: stagger(60, { from: "center" }),
      duration: 700,
      ease: "outBack",
    });
    const drift = animate(tiles, {
      translateY: () => [0, -6 - Math.random() * 10],
      duration: () => 2200 + Math.random() * 1400,
      delay: stagger(90),
      alternate: true,
      loop: true,
      ease: "inOutSine",
    });
    return () => {
      intro.revert();
      drift.revert();
    };
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-5 gap-4 p-12 rotate-[-6deg]">
      {TILES.map((t, i) => (
        <div
          key={t}
          className={`tile w-20 h-28 text-4xl reveal ${i % 4 === 0 ? "text-seal" : i % 3 === 0 ? "text-jade-deep" : ""}`}
        >
          {t}
        </div>
      ))}
    </div>
  );
}
