"use client";

import type { Release } from "@/domain/releases";
import { SOURCE_LABELS } from "@/domain/source";
import { useDictionary } from "@/i18n/use-dictionary";
import { RelativeTime } from "./relative-time";

function TickerItems({ releases, hidden }: { releases: Release[]; hidden?: boolean }) {
  const { t } = useDictionary();
  return (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center">
      {releases.map(({ view, chapter, sourceId }) => (
        <li key={`${view.slug}-${chapter.url}`} className="flex items-center">
          <a
            href={chapter.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={hidden ? -1 : undefined}
            aria-label={`${view.title}, ${t.chapter.name(chapter)}, ${t.chapter.opensIn(SOURCE_LABELS[sourceId].name)}`}
            className="flex items-baseline gap-2 px-5 whitespace-nowrap underline-offset-4 hover:underline"
          >
            <span className="font-bold">{view.title}</span>
            <span className="font-extrabold">{t.chapter.name(chapter)}</span>
            <RelativeTime iso={chapter.releasedAt} className="text-sm opacity-80" />
          </a>
          <span aria-hidden="true" className="text-xs text-lacquer">◆</span>
        </li>
      ))}
    </ul>
  );
}

export function ReleaseTicker({ releases }: { releases: Release[] }) {
  const { t } = useDictionary();
  if (releases.length === 0) return null;

  return (
    <section aria-label={t.ticker.label} className="relative flex h-14 items-stretch overflow-hidden border-y-[1.5px] border-ink bg-ink text-ground">
      <div className="relative z-10 flex shrink-0 items-center gap-3 bg-lacquer px-4 text-lacquer-ink sm:px-6">
        <span lang="ko" className="font-myeongjo text-xl font-extrabold tracking-[0.15em]">속보</span>
        <span className="hidden text-sm font-bold opacity-80 sm:inline">{t.ticker.label}</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none] motion-safe:overflow-hidden">
        <div className="animate-marquee flex w-max">
          <TickerItems releases={releases} />
          <TickerItems releases={releases} hidden />
        </div>
      </div>
    </section>
  );
}
