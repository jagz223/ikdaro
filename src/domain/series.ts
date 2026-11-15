import type { SourceId } from "./source";

export interface Chapter {
  number: number;
  season?: number;
  label: string;
  url: string;
  releasedAt: string;
}

export interface CatalogEntry {
  slug: string;
  title: string;
  nativeTitle?: string;
  sources: Partial<Record<SourceId, string>>;
}

export interface SourceFeed {
  sourceId: SourceId;
  seriesUrl: string;
  coverUrl?: string;
  nativeTitle?: string;
  chapters: Chapter[];
}

export type SourceResult =
  | { status: "ok"; sourceId: SourceId; feed: SourceFeed }
  | { status: "unavailable"; sourceId: SourceId };

export interface SeriesView {
  slug: string;
  title: string;
  nativeTitle?: string;
  coverUrl?: string;
  latestReleaseAt?: string;
  defaultSource: SourceId;
  sources: SourceResult[];
}

export interface SeriesSourceReader {
  readonly id: SourceId;
  read(reference: string): Promise<SourceFeed>;
}

export class SourceBlockedError extends Error {
  constructor(readonly url: string, readonly status: number) {
    super(`Source blocked or unavailable: ${status} ${url}`);
    this.name = "SourceBlockedError";
  }
}
