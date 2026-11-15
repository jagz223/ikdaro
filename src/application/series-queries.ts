import { cacheLife } from "next/cache";
import { catalog, findCatalogEntry } from "@/config/catalog";
import type { CatalogEntry, SeriesView, SourceResult } from "@/domain/series";
import { buildSeriesView, byLatestRelease } from "./build-series-view";
import { jobsFor, readPolitely } from "./read-plan";
import { readSource } from "./read-source";

const FEED_CHAPTERS_PER_SOURCE = 3;

function trimChapters(results: SourceResult[]): SourceResult[] {
  return results.map((result) =>
    result.status === "ok"
      ? { ...result, feed: { ...result.feed, chapters: result.feed.chapters.slice(0, FEED_CHAPTERS_PER_SOURCE) } }
      : result,
  );
}

async function readViews(entries: CatalogEntry[]): Promise<Array<[CatalogEntry, SourceResult[]]>> {
  const jobs = jobsFor(entries);
  const results = await readPolitely(jobs, readSource);
  return entries.map((entry) => [
    entry,
    jobs.filter((job) => job.slug === entry.slug).map((job) => results.get(job) as SourceResult),
  ]);
}

export async function getLatestFeed(): Promise<SeriesView[]> {
  "use cache";
  cacheLife("sources");
  const views = (await readViews(catalog)).map(([entry, results]) => buildSeriesView(entry, trimChapters(results)));
  return views.sort(byLatestRelease);
}

export async function getSeriesDetail(slug: string): Promise<SeriesView | undefined> {
  "use cache";
  cacheLife("sources");
  const entry = findCatalogEntry(slug);
  if (!entry) return undefined;
  const [[, results]] = await readViews([entry]);
  return buildSeriesView(entry, results);
}
