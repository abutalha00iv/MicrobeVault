"use client";

import { useEffect, useState } from "react";

export function StatsCounter({
  label,
  value,
  suffix = ""
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1400;
    const startTime = performance.now();

    const frame = (now: number) => {
      const raw = Math.min((now - startTime) / duration, 1);
      // ease-out cubic: fast start, smooth landing
      const eased = 1 - Math.pow(1 - raw, 3);
      setCount(Math.round(eased * value));
      if (raw < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }, [value]);

  return (
    <div className="glass-panel rounded-3xl p-5 text-center">
      <p className="font-[var(--font-display)] text-4xl text-white tabular-nums">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-300 leading-snug">{label}</p>
    </div>
  );
}
