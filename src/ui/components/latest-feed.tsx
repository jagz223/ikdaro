"use client";

import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue, useState } from "react";
import type { SeriesView } from "@/domain/series";
import { latestChapter, sourceIdsOf } from "@/domain/series-selectors";
import { SOURCE_IDS, SOURCE_LABELS, type SourceId } from "@/domain/source";
import { useReadProgress } from "@/features/read-progress/read-progress";
import { useDictionary } from "@/i18n/use-dictionary";
import { KanjiHeading } from "./kanji-heading";
import { SeriesCard } from "./series-card";

type SourceFilter = SourceId | "all";

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function LatestFeed({ views }: { views: SeriesView[] }) {
  const { t } = useDictionary();
  const { isRead } = useReadProgress();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [onlyPending, setOnlyPending] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const isPending = (view: SeriesView) => {
    const chapter = latestChapter(view);
    return chapter !== undefined && !isRead(view.slug, chapter);
  };

  const pendingCount = views.filter(isPending).length;
  const needle = normalize(deferredQuery.trim());
  const visible = views.filter(
    (view) =>
      (!needle || normalize(`${view.title} ${view.nativeTitle ?? ""}`).includes(needle)) &&
      (source === "all" || sourceIdsOf(view).includes(source)) &&
      (!onlyPending || isPending(view)),
  );

  const clearFilters = () => {
    setQuery("");
    setSource("all");
    setOnlyPending(false);
  };

  return (
    <section aria-labelledby="feed-heading" className="mx-auto mt-28 max-w-[1440px] scroll-mt-24 px-4 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <KanjiHeading id="feed-heading" kanji="最新話" label={t.feed.heading} korean="최신화" />
          <p className={`mt-6 text-lg font-bold ${pendingCount > 0 ? "text-lacquer" : "text-jade"}`}>
            {t.feed.finding(pendingCount, views.length)}
          </p>
        </div>

        <div className="flex flex-col gap-5 lg:items-end">
          <label className="relative block w-full max-w-md">
            <span className="sr-only">{t.feed.search}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.feed.search}
              className="h-11 w-full border-b-[1.5px] border-ink bg-transparent pr-8 text-base text-ink placeholder:text-ink-muted focus:border-lacquer focus:outline-none"
            />
            <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-lg">
              →
            </span>
          </label>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div role="radiogroup" aria-label={t.source.tabsLabel} className="flex gap-5">
              {(["all", ...SOURCE_IDS] as const).map((option) => {
                const selected = option === source;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSource(option)}
                    className={`relative cursor-pointer pb-1.5 text-sm transition-colors ${
                      selected ? "font-bold text-ink" : "font-medium text-ink-muted hover:text-ink"
                    }`}
                  >
                    {option === "all" ? t.feed.allSources : SOURCE_LABELS[option].name.split(" ")[0]}
                    {selected && (
                      <motion.span
                        layoutId="feed-source-filter"
                        className="absolute inset-x-0 bottom-0 h-[3px] bg-ink"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              aria-pressed={onlyPending}
              onClick={() => setOnlyPending((value) => !value)}
              className={`cursor-pointer px-4 py-2 text-sm font-bold transition-colors ${
                onlyPending ? "bg-lacquer text-lacquer-ink" : "border-[1.5px] border-ink hover:bg-ink hover:text-ground"
              }`}
            >
              {t.feed.onlyPending}
            </button>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-14 flex flex-col items-start gap-4 border-[1.5px] border-ink p-8">
          <p className="text-lg">{t.feed.empty}</p>
          <button type="button" onClick={clearFilters} className="link-underline cursor-pointer font-bold text-lacquer">
            {t.feed.clearFilters}
          </button>
        </div>
      ) : (
        <motion.ul layout className="mt-14 grid gap-x-12 lg:grid-cols-2">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((view, index) => (
              <motion.li
                key={view.slug}
                layout
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (index % 2) * 0.07 }}
              >
                <SeriesCard view={view} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
}
