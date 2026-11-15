"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useDeferredValue, useId, useState, ViewTransition } from "react";
import type { SeriesView } from "@/domain/series";
import { feedOf, sourceIdsOf } from "@/domain/series-selectors";
import { SOURCE_LABELS } from "@/domain/source";
import { useReadProgress } from "@/features/read-progress/read-progress";
import { useDictionary } from "@/i18n/use-dictionary";
import { ChapterRow } from "./chapter-row";
import { Cover } from "./cover";
import { SourcePanelMessage } from "./series-card";
import { SourceTabs } from "./source-tabs";

const EASE = [0.22, 1, 0.36, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
});

export function SeriesDetail({ view }: { view: SeriesView }) {
  const { t } = useDictionary();
  const { isRead } = useReadProgress();
  const [active, setActive] = useState(view.defaultSource);
  const [newestFirst, setNewestFirst] = useState(true);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const panelId = useId();
  const sources = sourceIdsOf(view);
  const feed = feedOf(view, active);
  const chapters = feed?.chapters ?? [];
  const readCount = chapters.filter((chapter) => isRead(view.slug, chapter)).length;
  const progress = chapters.length ? readCount / chapters.length : 0;
  const ordered = newestFirst ? chapters : [...chapters].reverse();
  const visible = deferredQuery ? ordered.filter((chapter) => String(chapter.number).includes(deferredQuery)) : ordered;
  const latest = chapters[0];

  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[620px] overflow-hidden">
        <Cover src={view.coverUrl} title="" eager className="h-full w-full scale-125 opacity-35 blur-3xl saturate-150" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(var(--scrim)/0.35),var(--ground))]" />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-8 md:pt-12">
        <motion.div {...rise(0)}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-medium text-ink-muted transition-colors hover:text-lacquer"
          >
            <span aria-hidden="true">←</span>
            {t.detail.back}
          </Link>
        </motion.div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16">
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:max-w-none">
              <ViewTransition name={`cover-${view.slug}`}>
                <div className="overflow-hidden rounded-[10px] bg-surface-raised">
                  <Cover src={view.coverUrl} title={view.title} eager className="aspect-[3/4] w-full" />
                </div>
              </ViewTransition>
              {view.nativeTitle && (
                <motion.p
                  {...rise(0.3)}
                  lang={/[가-힣]/.test(view.nativeTitle) ? "ko" : "ja"}
                  className="vertical-text absolute top-4 -right-3 max-h-[85%] overflow-hidden rounded-[3px] bg-lacquer px-2 py-3 font-myeongjo text-lg leading-none font-bold tracking-[0.12em] text-lacquer-ink"
                >
                  {view.nativeTitle}
                </motion.p>
              )}
            </div>

            <motion.dl {...rise(0.15)} className="grid grid-cols-2 gap-3">
              <div className="border-[1.5px] border-ink p-4">
                <dt className="text-sm text-ink-muted">{SOURCE_LABELS[active].name}</dt>
                <dd className="mt-1 text-2xl font-black tabular-nums">{t.detail.chapters(chapters.length)}</dd>
              </div>
              <div className="border-[1.5px] border-ink p-4">
                <dt className="text-sm text-ink-muted">{t.detail.latest}</dt>
                <dd className="mt-1 text-2xl font-black tabular-nums">{latest ? `${latest.season ? `S${latest.season}·` : ""}${latest.number}` : "—"}</dd>
              </div>
              <div className="col-span-2 border-[1.5px] border-ink p-4">
                <dt className="flex justify-between text-sm text-ink-muted">
                  <span>{t.detail.progress(readCount, chapters.length)}</span>
                  <span className="tabular-nums">{Math.round(progress * 100)}%</span>
                </dt>
                <dd className="mt-3 h-[5px] overflow-hidden bg-ink/15">
                  <motion.div
                    className="h-full origin-left bg-lacquer"
                    initial={false}
                    animate={{ scaleX: progress }}
                    transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                  />
                </dd>
              </div>
            </motion.dl>

            <motion.ul {...rise(0.25)} className="flex flex-col gap-1">
              {sources.map((sourceId) => {
                const sourceFeed = feedOf(view, sourceId);
                return (
                  <li key={sourceId}>
                    <a
                      href={sourceFeed?.seriesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!sourceFeed}
                      className="flex items-center justify-between border-b-[1.5px] border-ink/20 px-1 py-3 text-base transition-colors hover:text-lacquer aria-disabled:pointer-events-none aria-disabled:opacity-50"
                    >
                      <span>{t.detail.openSeries(SOURCE_LABELS[sourceId].name)}</span>
                      <span aria-hidden="true" className="text-ink-muted">↗</span>
                    </a>
                  </li>
                );
              })}
            </motion.ul>
          </aside>

          <div className="min-w-0">
            <motion.h1
              {...rise(0.05)}
              className="font-myeongjo text-[clamp(2.5rem,5.5vw,5rem)] leading-[1] font-medium tracking-[-0.01em] text-balance"
            >
              {view.title}
            </motion.h1>
            {latest && (
              <motion.div {...rise(0.15)} className="mt-8 flex flex-wrap items-center gap-3">
                <motion.a
                  href={latest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex h-12 items-center gap-3 bg-lacquer px-6 text-base font-bold text-lacquer-ink"
                >
                  {t.detail.readLatest(t.chapter.name(latest))}
                  <span aria-hidden="true">→</span>
                </motion.a>
              </motion.div>
            )}

            <motion.div {...rise(0.25)} className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {sources.length > 1 ? (
                <SourceTabs sources={sources} active={active} onSelect={setActive} panelId={panelId} variant="full" />
              ) : (
                <p className="text-lg font-bold">{SOURCE_LABELS[active].name}</p>
              )}
              <div className="flex gap-2">
                <label className="flex-1 sm:flex-none">
                  <span className="sr-only">{t.detail.searchChapters}</span>
                  <input
                    type="search"
                    inputMode="decimal"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t.detail.searchChapters}
                    className="h-11 w-full border-b-[1.5px] border-ink bg-transparent text-base text-ink placeholder:text-ink-muted focus:border-lacquer focus:outline-none sm:w-52"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setNewestFirst((value) => !value)}
                  className="h-11 cursor-pointer border-[1.5px] border-ink px-4 text-sm font-bold whitespace-nowrap text-ink transition-colors hover:bg-ink hover:text-ground"
                >
                  {newestFirst ? t.detail.newest : t.detail.oldest}
                </button>
              </div>
            </motion.div>

            <div id={panelId} role={sources.length > 1 ? "tabpanel" : undefined} className="mt-6 border-t-[1.5px] border-ink pt-2">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  {!feed || chapters.length === 0 ? (
                    <SourcePanelMessage unavailable={!feed} />
                  ) : visible.length === 0 ? (
                    <p className="px-3 py-4 text-ink-muted">{t.detail.noMatches}</p>
                  ) : (
                    <ul className="chapter-list">
                      {visible.map((chapter) => (
                        <li key={chapter.url}>
                          <ChapterRow seriesSlug={view.slug} chapter={chapter} sourceId={active} size="roomy" />
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
