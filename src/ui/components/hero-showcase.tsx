"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SeriesView } from "@/domain/series";
import { feedOf, latestChapter, sourceIdsOf } from "@/domain/series-selectors";
import { SOURCE_LABELS } from "@/domain/source";
import { useReadProgress } from "@/features/read-progress/read-progress";
import { useDictionary } from "@/i18n/use-dictionary";
import { japaneseChapter, koreanChapter, scriptOf } from "@/ui/format/east-asian";
import { Cover } from "./cover";
import { ElapsedCounter } from "./elapsed-counter";
import { RelativeTime } from "./relative-time";

const SLIDE_MS = 9000;
const EASE = [0.22, 1, 0.36, 1] as const;
const KANJI_NUMERALS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

const stagger: Variants = {
  enter: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};

const rise: Variants = {
  initial: { opacity: 0, y: 22 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: EASE } },
};

function SlideDetails({ view }: { view: SeriesView }) {
  const { t } = useDictionary();
  const { isRead } = useReadProgress();
  const chapter = latestChapter(view);
  const chapters = feedOf(view, view.defaultSource)?.chapters ?? [];
  const pending = chapters.filter((item) => !isRead(view.slug, item)).length;

  return (
    <motion.div variants={stagger} initial="initial" animate="enter" exit="exit" className="flex flex-col gap-8">
      {chapter && (
        <motion.div variants={rise}>
          <ElapsedCounter since={chapter.releasedAt} />
          <p className="mt-3 text-sm text-ink-muted">
            {t.counter.since} {SOURCE_LABELS[view.defaultSource].name} · <RelativeTime iso={chapter.releasedAt} />
          </p>
        </motion.div>
      )}
      <motion.div variants={rise} className="flex flex-col gap-3">
        <h2 className="font-mincho text-[clamp(2rem,4vw,3.6rem)] leading-[1.02] font-medium tracking-[-0.01em] text-balance">
          <Link href={`/series/${view.slug}`} className="transition-colors hover:text-lacquer">
            {view.title}
          </Link>
        </h2>
        {chapter && (
          <p className="text-lg">
            <span lang="ja" className="font-mincho font-bold text-lacquer">{japaneseChapter(chapter)}</span>
            <span className="text-ink-muted">
              {" "}({t.chapter.name(chapter)} · <span lang="ko">{koreanChapter(chapter)}</span>)
            </span>
          </p>
        )}
        <p className="text-sm text-ink-muted">
          {sourceIdsOf(view).map((id) => SOURCE_LABELS[id].name).join(" / ")}
          <span className={`ml-3 font-bold ${pending > 0 ? "text-lacquer" : "text-jade"}`}>{t.hero.pendingInSeries(pending)}</span>
        </p>
      </motion.div>
      <motion.div variants={rise} className="flex flex-wrap items-center gap-x-8 gap-y-3 text-base font-bold">
        {chapter && (
          <a
            href={chapter.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 bg-lacquer px-5 py-3 text-lacquer-ink transition-transform hover:-translate-y-0.5"
          >
            {t.hero.readChapter(t.chapter.name(chapter))}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        )}
        <Link href={`/series/${view.slug}`} prefetch className="link-underline inline-flex items-center gap-2">
          <span aria-hidden="true">↳</span>
          {t.hero.viewSeries}
        </Link>
      </motion.div>
    </motion.div>
  );
}

function SlideCover({ view }: { view: SeriesView }) {
  return (
    <motion.div
      initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
      animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
      exit={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
      transition={{ duration: 0.85, ease: EASE }}
      className="relative"
    >
      <Link href={`/series/${view.slug}`} tabIndex={-1} aria-hidden="true" className="block overflow-hidden rounded-[10px]">
        <motion.div
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          <Cover src={view.coverUrl} title="" eager className="aspect-[3/4] w-full" />
        </motion.div>
      </Link>
      {view.nativeTitle && (
        <p
          lang={scriptOf(view.nativeTitle)}
          className="vertical-text absolute top-0 -left-9 hidden max-h-full overflow-hidden font-mincho text-base font-bold tracking-[0.3em] text-ink-muted sm:block"
        >
          {view.nativeTitle}
        </p>
      )}
    </motion.div>
  );
}

export function HeroShowcase({ views }: { views: SeriesView[] }) {
  const { t } = useDictionary();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const running = !paused && !hovered && !reduceMotion && views.length > 1;
  const current = views[index];

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setIndex((value) => (value + 1) % views.length), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [running, index, views.length]);

  if (!current) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t.hero.label}
      className="px-4 pt-4 pb-10 sm:px-8 sm:pt-6"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div className="relative isolate mx-auto grid max-w-[1440px] overflow-hidden border-[1.5px] border-ink bg-ground lg:min-h-[min(84svh,780px)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[27%] z-20 hidden w-[12%] bg-white mix-blend-difference lg:block"
        />

        <div className="flex flex-col justify-between gap-10 p-6 sm:p-10 lg:p-12">
          <div>
            <p aria-hidden="true" lang="ja" className="spaced-kana text-[clamp(4.5rem,13vw,12rem)] leading-[0.92] font-black">
              新着
            </p>
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: EASE, delay: 0.2 }}
              className="mt-4 block h-[5px] w-full origin-left bg-ink"
            />
            <p className="mt-3 text-base font-medium text-ink-muted">
              ({t.hero.newArrival} · <span lang="ko">신작</span>)
            </p>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <SlideDetails key={current.slug} view={current} />
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-6 border-t-[1.5px] border-ink p-6 sm:p-10 lg:border-t-0 lg:border-l-[1.5px] lg:p-12">
          <div className="relative mx-auto w-full max-w-[22rem] sm:pl-9 lg:mt-4">
            <AnimatePresence mode="wait" initial={false}>
              <SlideCover key={current.slug} view={current} />
            </AnimatePresence>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <ol className="flex gap-3">
              {views.map((view, slideIndex) => {
                const selected = slideIndex === index;
                return (
                  <li key={view.slug}>
                    <button
                      type="button"
                      aria-label={t.hero.showSlide(slideIndex + 1, view.title)}
                      aria-current={selected}
                      onClick={() => setIndex(slideIndex)}
                      className="group flex cursor-pointer flex-col items-center gap-2"
                    >
                      <span className="relative block h-14 w-10 overflow-hidden rounded-[4px] sm:h-16 sm:w-12">
                        <Cover src={view.coverUrl} title="" className={`h-full w-full transition-opacity ${selected ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`} />
                      </span>
                      <span
                        lang="ja"
                        aria-hidden="true"
                        className={`font-mincho text-sm font-bold ${selected ? "text-lacquer underline decoration-2 underline-offset-4" : "text-ink-faint group-hover:text-ink"}`}
                      >
                        {KANJI_NUMERALS[slideIndex]}
                      </span>
                      {selected && (
                        <motion.span
                          key={`${view.slug}-${running}`}
                          aria-hidden="true"
                          className="block h-[3px] w-full origin-left bg-lacquer"
                          initial={{ scaleX: running ? 0 : 1 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: running ? SLIDE_MS / 1000 : 0, ease: "linear" }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? t.hero.play : t.hero.pause}
              className="link-underline mb-1 cursor-pointer text-sm font-bold"
            >
              {paused ? t.hero.play : t.hero.pause}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
