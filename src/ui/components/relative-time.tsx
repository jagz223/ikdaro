"use client";

import { formatRelative } from "@/features/time/relative-time";
import { useNow } from "@/features/time/use-now";
import { useDictionary } from "@/i18n/use-dictionary";

interface RelativeTimeProps {
  iso: string;
  className?: string;
  short?: boolean;
}

export function RelativeTime({ iso, className = "", short = false }: RelativeTimeProps) {
  const now = useNow();
  const { language } = useDictionary();
  return (
    <time dateTime={iso} title={iso.slice(0, 10)} className={`tabular-nums ${className}`}>
      {now === undefined ? iso.slice(0, 10) : formatRelative(iso, now, language, short ? "short" : "long")}
    </time>
  );
}
