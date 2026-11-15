import type { Chapter, SeriesView, SourceFeed } from "./series";
import type { SourceId } from "./source";

export function feedOf(view: SeriesView, sourceId: SourceId): SourceFeed | undefined {
  const result = view.sources.find((source) => source.sourceId === sourceId);
  return result?.status === "ok" ? result.feed : undefined;
}

export function latestChapter(view: SeriesView): Chapter | undefined {
  return feedOf(view, view.defaultSource)?.chapters[0];
}

export function sourceIdsOf(view: SeriesView): SourceId[] {
  return view.sources.map((source) => source.sourceId);
}
