import { chapterKey } from "./chapter-number";
import type { Chapter, SeriesView } from "./series";
import type { SourceId } from "./source";

export interface Release {
  view: SeriesView;
  chapter: Chapter;
  sourceId: SourceId;
}

export function recentReleases(views: SeriesView[]): Release[] {
  const releases = views.flatMap((view) =>
    view.sources.flatMap((source) =>
      source.status === "ok"
        ? source.feed.chapters.map((chapter) => ({ view, chapter, sourceId: source.sourceId }))
        : [],
    ),
  );
  const seen = new Set<string>();
  return releases
    .sort((a, b) => b.chapter.releasedAt.localeCompare(a.chapter.releasedAt))
    .filter((release) => {
      const key = chapterKey(release.view.slug, release.chapter);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
