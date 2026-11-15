"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/i18n/use-dictionary";

const SECOND_MS = 1000;
const UNIT_SECONDS = [86_400, 3_600, 60, 1] as const;
const KANJI_UNITS = ["日", "時間", "分", "秒"] as const;

function splitElapsed(fromIso: string, now: number): number[] {
  let remaining = Math.max(0, Math.floor((now - new Date(fromIso).getTime()) / SECOND_MS));
  return UNIT_SECONDS.map((unit) => {
    const value = Math.floor(remaining / unit);
    remaining -= value * unit;
    return value;
  });
}

function useSecondClock(): number | undefined {
  const [now, setNow] = useState<number>();
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, SECOND_MS);
    return () => clearInterval(timer);
  }, []);
  return now;
}

export function ElapsedCounter({ since }: { since: string }) {
  const { t } = useDictionary();
  const now = useSecondClock();
  const parts = now === undefined ? undefined : splitElapsed(since, now);
  const labels = [t.counter.days, t.counter.hours, t.counter.minutes, t.counter.seconds];

  return (
    <div role="timer" aria-live="off" aria-label={t.counter.label}>
      <p className="flex items-baseline text-[clamp(2.4rem,5.2vw,4.75rem)] leading-none font-black tabular-nums">
        {UNIT_SECONDS.map((unit, index) => (
          <span key={unit} className="flex items-baseline">
            {index > 0 && <span className="px-[0.12em] text-ink-faint">:</span>}
            <span>{parts ? String(parts[index]).padStart(2, "0") : "--"}</span>
          </span>
        ))}
      </p>
      <span aria-hidden="true" className="mt-3 block h-[4px] w-full max-w-[34rem] bg-ink" />
      <ul className="mt-3 grid max-w-[34rem] grid-cols-4 text-sm">
        {labels.map((label, index) => (
          <li key={label} className="flex flex-col">
            <span className="link-underline font-medium">{label}</span>
            <span lang="ja" className="text-xs text-ink-muted">({KANJI_UNITS[index]})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
