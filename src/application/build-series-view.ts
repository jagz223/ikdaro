import type { CatalogEntry, SeriesView, SourceFeed, SourceResult } from "@/domain/series";
import type { SourceId } from "@/domain/source";

const COVER_PRIORITY: SourceId[] = ["asura", "weebcentral", "demonic"];

function availableFeeds(results: SourceResult[]): SourceFeed[] {
  return results.flatMap((result) => (result.status === "ok" ? [result.feed] : []));
}

function newestRelease(feed: SourceFeed): string {
  return feed.chapters[0]?.releasedAt ?? "";
}

function pickDefaultSource(feeds: SourceFeed[], fallback: SourceId): SourceId {
  const [newest] = [...feeds].sort((a, b) => newestRelease(b).localeCompare(newestRelease(a)));
  return newest?.sourceId ?? fallback;
}

function pickCover(feeds: SourceFeed[]): string | undefined {
  return COVER_PRIORITY.map((id) => feeds.find((feed) => feed.sourceId === id)?.coverUrl).find(Boolean);
}

export function buildSeriesView(entry: CatalogEntry, results: SourceResult[]): SeriesView {
  const feeds = availableFeeds(results);
  const defaultSource = pickDefaultSource(feeds, results[0].sourceId);
  return {
    slug: entry.slug,
    title: entry.title,
    nativeTitle: entry.nativeTitle ?? feeds.find((feed) => feed.nativeTitle)?.nativeTitle,
    coverUrl: pickCover(feeds),
    latestReleaseAt: feeds.map(newestRelease).sort().at(-1) || undefined,
    defaultSource,
    sources: results,
  };
}

export function byLatestRelease(a: SeriesView, b: SeriesView): number {
  return (b.latestReleaseAt ?? "").localeCompare(a.latestReleaseAt ?? "");
}
