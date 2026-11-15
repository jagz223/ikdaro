"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useId, useState, ViewTransition } from "react";
import type { SeriesView } from "@/domain/series";
import { feedOf, latestChapter, sourceIdsOf } from "@/domain/series-selectors";
import { useReadProgress } from "@/features/read-progress/read-progress";
import { useDictionary } from "@/i18n/use-dictionary";
import { scriptOf } from "@/ui/format/east-asian";
import { ChapterRow } from "./chapter-row";
import { Cover } from "./cover";
import { SourceTabs } from "./source-tabs";

export function SourcePanelMessage({ unavailable }: { unavailable: boolean }) {
  const { t } = useDictionary();
  return <p className="px-2 py-3 text-sm text-ink-muted">{unavailable ? t.source.unavailable : t.source.noChapters}</p>;
}

export function SeriesCard({ view }: { view: SeriesView }) {
  const { t } = useDictionary();
  const [active, setActive] = useState(view.defaultSource);
  const { isRead } = useReadProgress();
  const panelId = useId();
  const sources = sourceIdsOf(view);
  const feed = feedOf(view, active);
  const newest = latestChapter(view);
  const pending = newest !== undefined && !isRead(view.slug, newest);

  return (
    <article className={`group/card relative flex h-full gap-4 border-t-[3px] pt-5 pb-6 transition-colors duration-500 sm:gap-6 ${pending ? "border-lacquer" : "border-jade"}`}>
      <div className="flex shrink-0 gap-2.5 self-start">
        {view.nativeTitle && (
          <p
            lang={scriptOf(view.nativeTitle)}
            aria-hidden="true"
            className="vertical-text hidden max-h-36 overflow-hidden font-mincho text-xs font-bold tracking-[0.25em] text-ink-muted sm:block"
          >
            {view.nativeTitle}
          </p>
        )}
        <Link href={`/series/${view.slug}`} prefetch className="group block" tabIndex={-1} aria-hidden="true">
          <ViewTransition name={`cover-${view.slug}`}>
            <div className="relative w-20 overflow-hidden rounded-[8px] sm:w-28">
              <Cover
                src={view.coverUrl}
                title={view.title}
                className="ink-reveal aspect-[3/4] w-full group-hover/card:scale-[1.04]"
              />
            </div>
          </ViewTransition>
        </Link>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <h3 className="flex min-w-0 items-baseline gap-2 font-mincho text-xl leading-tight font-medium sm:text-2xl">
            <span
              lang="ja"
              aria-label={pending ? t.feed.pendingBadge : t.feed.caughtUpBadge}
              title={pending ? t.feed.pendingBadge : t.feed.caughtUpBadge}
              className={`grid size-5 shrink-0 -translate-y-0.5 place-items-center font-sans text-[0.65rem] font-black transition-colors duration-500 ${
                pending ? "bg-lacquer text-lacquer-ink" : "bg-jade text-jade-ink"
              }`}
            >
              {pending ? "新" : "済"}
            </span>
            <Link
              href={`/series/${view.slug}`}
              prefetch
              className="line-clamp-2 decoration-1 underline-offset-[0.25em] transition-colors hover:text-lacquer hover:underline"
            >
              {view.title}
            </Link>
          </h3>
          {sources.length > 1 && <SourceTabs sources={sources} active={active} onSelect={setActive} panelId={panelId} />}
        </div>
        <div id={panelId} role={sources.length > 1 ? "tabpanel" : undefined} className="-mx-1.5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {feed && feed.chapters.length > 0 ? (
                feed.chapters.map((chapter) => (
                  <li key={chapter.url}>
                    <ChapterRow seriesSlug={view.slug} chapter={chapter} sourceId={active} />
                  </li>
                ))
              ) : (
                <li>
                  <SourcePanelMessage unavailable={!feed} />
                </li>
              )}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </article>
  );
}
