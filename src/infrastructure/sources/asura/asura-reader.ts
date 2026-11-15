import { z } from "zod";
import { byNewestFirst } from "@/domain/chapter-number";
import type { Chapter, SeriesSourceReader, SourceFeed } from "@/domain/series";
import { fetchJson } from "@/infrastructure/http/fetch-text";

const API_ORIGIN = "https://api.asurascans.com/api";
const SITE_ORIGIN = "https://asurascans.com";
const KOREAN_TITLE = /^[가-힣\d\s.,:!?'’-]+$/;
const TITLE_SEPARATOR = /\s*[•|/]\s*/;
const MAX_NATIVE_TITLE_LENGTH = 24;

export function pickKoreanTitle(altTitles: string[] | null | undefined): string | undefined {
  return (altTitles ?? [])
    .flatMap((title) => title.split(TITLE_SEPARATOR))
    .map((title) => title.trim())
    .find((title) => title.length <= MAX_NATIVE_TITLE_LENGTH && KOREAN_TITLE.test(title));
}

const unwrapData = (value: unknown) =>
  value && typeof value === "object" && "data" in value && !Array.isArray(value.data) ? value.data : value;

const seriesSchema = z.preprocess(
  unwrapData,
  z.object({
    series: z.object({
      cover: z.string().url().optional(),
      public_url: z.string(),
      alt_titles: z.array(z.string()).nullish(),
    }),
  }),
);

const chaptersSchema = z.object({
  data: z.array(
    z.object({
      number: z.number(),
      is_premium: z.boolean(),
      early_access_until: z.string().nullish(),
      published_at: z.string(),
    }),
  ),
});

type AsuraChapter = z.infer<typeof chaptersSchema>["data"][number];

function isFreeAt(chapter: AsuraChapter, now: Date): boolean {
  const unlocksAt = chapter.early_access_until ? new Date(chapter.early_access_until) : undefined;
  return !chapter.is_premium && (!unlocksAt || unlocksAt <= now);
}

function freeReleaseDate(chapter: AsuraChapter): string {
  return new Date(chapter.early_access_until ?? chapter.published_at).toISOString();
}

export function parseAsura(seriesJson: unknown, chaptersJson: unknown, now: Date): Omit<SourceFeed, "sourceId"> {
  const { series } = seriesSchema.parse(seriesJson);
  const seriesUrl = `${SITE_ORIGIN}${series.public_url}`;
  const chapters: Chapter[] = chaptersSchema
    .parse(chaptersJson)
    .data.filter((chapter) => isFreeAt(chapter, now))
    .map((chapter) => ({
      number: chapter.number,
      label: `Chapter ${chapter.number}`,
      url: `${seriesUrl}/chapter/${chapter.number}`,
      releasedAt: freeReleaseDate(chapter),
    }))
    .sort(byNewestFirst);

  return {
    seriesUrl,
    coverUrl: series.cover,
    nativeTitle: pickKoreanTitle(series.alt_titles),
    chapters,
  };
}

export const asuraReader: SeriesSourceReader = {
  id: "asura",
  async read(slug) {
    const [seriesJson, chaptersJson] = await Promise.all([
      fetchJson(`${API_ORIGIN}/series/${slug}`),
      fetchJson(`${API_ORIGIN}/series/${slug}/chapters`),
    ]);
    return { sourceId: "asura", ...parseAsura(seriesJson, chaptersJson, new Date()) };
  },
};
