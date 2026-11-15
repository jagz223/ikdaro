const KEYWORD_NUMBER = /(?:chapter|episode|ch\.?|ep\.?)\s*(\d+(?:\.\d+)?)/i;
const ANY_NUMBER = /(\d+(?:\.\d+)?)/;
const SEASON = /\bS(?:eason)?\s*(\d+)\b/i;

export interface ChapterIdentity {
  number: number;
  season?: number;
}

export function parseChapterLabel(label: string): ChapterIdentity {
  const number = label.match(KEYWORD_NUMBER)?.[1] ?? label.match(ANY_NUMBER)?.[1];
  const season = label.match(SEASON)?.[1];
  return {
    number: number === undefined ? Number.NaN : Number(number),
    ...(season ? { season: Number(season) } : {}),
  };
}

export function chapterKey(seriesSlug: string, chapter: ChapterIdentity): string {
  const season = chapter.season ? `s${chapter.season}:` : "";
  return `${seriesSlug}:${season}${Number(chapter.number)}`;
}

export function byNewestFirst<T extends ChapterIdentity & { releasedAt: string }>(a: T, b: T): number {
  return (b.season ?? 0) - (a.season ?? 0) || b.number - a.number || b.releasedAt.localeCompare(a.releasedAt);
}
