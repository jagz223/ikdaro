"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { Release } from "@/domain/releases";
import { DAY_MS } from "@/features/time/relative-time";
import { useNow } from "@/features/time/use-now";
import { useDictionary } from "@/i18n/use-dictionary";
import { KOREAN_WEEKDAYS } from "@/ui/format/east-asian";
import { Cover } from "./cover";
import { HangulHeading } from "./hangul-heading";

const DAYS_SHOWN = 7;
const MAX_PER_DAY = 4;

interface DayColumn {
  date: Date;
  isToday: boolean;
  releases: Release[];
}

function startOfDay(time: number): Date {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildWeek(releases: Release[], now: number): DayColumn[] {
  const today = startOfDay(now).getTime();
  return Array.from({ length: DAYS_SHOWN }, (_, offset) => {
    const dayStart = today - (DAYS_SHOWN - 1 - offset) * DAY_MS;
    const seen = new Set<string>();
    const dayReleases = releases.filter((release) => {
      const released = startOfDay(new Date(release.chapter.releasedAt).getTime()).getTime();
      if (released !== dayStart || seen.has(release.view.slug)) return false;
      seen.add(release.view.slug);
      return true;
    });
    return { date: new Date(dayStart), isToday: dayStart === today, releases: dayReleases };
  });
}

function DayCard({ day, index }: { day: DayColumn; index: number }) {
  const { t, language } = useDictionary();
  const weekday = day.date.getDay();
  const overflow = day.releases.length - MAX_PER_DAY;

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      className={`flex w-[12rem] shrink-0 snap-start flex-col border-r-[1.5px] border-ink p-4 last:border-r-0 lg:w-auto ${
        day.isToday ? "bg-ink text-ground" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <span lang="ko" className="text-5xl leading-none font-black">
          {KOREAN_WEEKDAYS[weekday]}
        </span>
        <span className="text-right text-xs leading-tight">
          <span className="block tabular-nums">{day.date.toLocaleDateString(language, { day: "numeric", month: "short" })}</span>
          <span className="block capitalize opacity-70">{day.date.toLocaleDateString(language, { weekday: "long" })}</span>
          {day.isToday && <span className="mt-1 block font-bold underline decoration-2 underline-offset-2">{t.week.today}</span>}
        </span>
      </div>
      <span aria-hidden="true" className={`mt-3 block h-[3px] w-full ${day.isToday ? "bg-ground" : "bg-ink"}`} />

      {day.releases.length === 0 ? (
        <p className="mt-5 text-sm opacity-60">
          <span lang="ko" className="mr-2 font-myeongjo text-xl">휴</span>({t.week.empty})
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {day.releases.slice(0, MAX_PER_DAY).map(({ view, chapter }) => (
            <li key={view.slug}>
              <Link href={`/series/${view.slug}`} className="group flex items-center gap-2.5">
                <span className="block h-12 w-9 shrink-0 overflow-hidden rounded-[3px]">
                  <Cover src={view.coverUrl} title="" className="ink-reveal h-full w-full" />
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-1 text-sm font-bold group-hover:underline">{view.title}</span>
                  <span className="block text-xs font-bold opacity-70">{t.chapter.name(chapter)}</span>
                </span>
              </Link>
            </li>
          ))}
          {overflow > 0 && <li className="link-underline text-xs font-bold">{t.week.more(overflow)}</li>}
        </ul>
      )}
    </motion.li>
  );
}

export function WeekStrip({ releases }: { releases: Release[] }) {
  const { t } = useDictionary();
  const now = useNow();
  const week = now === undefined ? [] : buildWeek(releases, now);
  const total = week.reduce((sum, day) => sum + day.releases.length, 0);

  return (
    <section aria-labelledby="week-heading" className="mx-auto mt-24 max-w-[1440px] scroll-mt-24 px-4 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <HangulHeading id="week-heading" hangul="이번 주" label={t.week.heading} />
        {now !== undefined && <p className="text-base font-medium">{t.week.finding(total)}</p>}
      </div>
      <ol className="mt-10 flex snap-x snap-mandatory overflow-x-auto border-[1.5px] border-ink [scrollbar-width:thin] lg:grid lg:grid-cols-7 lg:overflow-visible">
        {now === undefined
          ? Array.from({ length: DAYS_SHOWN }, (_, index) => (
              <li key={index} className="h-56 w-[12rem] shrink-0 animate-pulse border-r-[1.5px] border-ink last:border-r-0 lg:w-auto" />
            ))
          : week.map((day, index) => <DayCard key={day.date.toISOString()} day={day} index={index} />)}
      </ol>
    </section>
  );
}
