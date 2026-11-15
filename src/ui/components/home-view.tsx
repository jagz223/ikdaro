"use client";

import { useMemo } from "react";
import { recentReleases } from "@/domain/releases";
import type { SeriesView } from "@/domain/series";
import { HeroShowcase } from "./hero-showcase";
import { LatestFeed } from "./latest-feed";
import { ReleaseTicker } from "./release-ticker";
import { WeekStrip } from "./week-strip";

const HERO_SLIDES = 5;
const TICKER_ITEMS = 16;

export function HomeView({ views }: { views: SeriesView[] }) {
  const releases = useMemo(() => recentReleases(views), [views]);
  const heroViews = useMemo(
    () => views.filter((view) => view.coverUrl && view.latestReleaseAt).slice(0, HERO_SLIDES),
    [views],
  );

  return (
    <>
      <HeroShowcase views={heroViews} />
      <ReleaseTicker releases={releases.slice(0, TICKER_ITEMS)} />
      <WeekStrip releases={releases} />
      <LatestFeed views={views} />
    </>
  );
}
