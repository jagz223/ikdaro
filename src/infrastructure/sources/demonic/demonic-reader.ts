import * as cheerio from "cheerio";
import { byNewestFirst, parseChapterLabel } from "@/domain/chapter-number";
import type { Chapter, SeriesSourceReader, SourceFeed } from "@/domain/series";
import { fetchText } from "@/infrastructure/http/fetch-text";

const SITE_ORIGIN = "https://demonicscans.org";
const DATE_PATTERN = /\d{4}-\d{2}-\d{2}/;

export function parseDemonic(html: string, seriesUrl: string): Omit<SourceFeed, "sourceId"> {
  const $ = cheerio.load(html);
  const chapters: Chapter[] = $("a.chplinks")
    .toArray()
    .map((element) => {
      const link = $(element);
      const date = link.find("span").text().match(DATE_PATTERN)?.[0];
      const label = link.clone().children().remove().end().text().trim();
      return {
        ...parseChapterLabel(label),
        label,
        url: new URL(link.attr("href") ?? "", SITE_ORIGIN).toString(),
        releasedAt: date ? new Date(`${date}T00:00:00Z`).toISOString() : "",
      };
    })
    .filter((chapter) => Number.isFinite(chapter.number) && chapter.releasedAt)
    .sort(byNewestFirst);

  const cover = $('meta[property="og:image"]').attr("content");
  return { seriesUrl, coverUrl: cover ? encodeURI(cover) : undefined, chapters };
}

export const demonicReader: SeriesSourceReader = {
  id: "demonic",
  async read(slug) {
    const seriesUrl = `${SITE_ORIGIN}/manga/${slug}`;
    return { sourceId: "demonic", ...parseDemonic(await fetchText(seriesUrl), seriesUrl) };
  },
};
