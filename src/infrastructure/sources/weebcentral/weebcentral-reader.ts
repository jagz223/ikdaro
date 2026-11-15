import * as cheerio from "cheerio";
import { byNewestFirst, parseChapterLabel } from "@/domain/chapter-number";
import type { Chapter, SeriesSourceReader, SourceFeed } from "@/domain/series";
import { fetchText } from "@/infrastructure/http/fetch-text";

const SITE_ORIGIN = "https://weebcentral.com";
const COVER_ORIGIN = "https://temp.compsci88.com/cover/normal";

export function parseWeebCentral(html: string): Chapter[] {
  const $ = cheerio.load(html);
  return $('a[href*="/chapters/"]')
    .toArray()
    .map((element) => {
      const link = $(element);
      const label = link.find("span.grow > span").first().text().trim();
      const releasedAt = new Date(link.find("time").attr("datetime") ?? "");
      return {
        ...parseChapterLabel(label),
        label,
        url: new URL(link.attr("href") ?? "", SITE_ORIGIN).toString(),
        releasedAt: Number.isNaN(releasedAt.getTime()) ? "" : releasedAt.toISOString(),
      };
    })
    .filter((chapter) => Number.isFinite(chapter.number) && chapter.releasedAt)
    .sort(byNewestFirst);
}

export const weebCentralReader: SeriesSourceReader = {
  id: "weebcentral",
  async read(reference) {
    const [seriesId] = reference.split("/");
    const html = await fetchText(`${SITE_ORIGIN}/series/${seriesId}/full-chapter-list`);
    const feed: Omit<SourceFeed, "sourceId"> = {
      seriesUrl: `${SITE_ORIGIN}/series/${reference}`,
      coverUrl: `${COVER_ORIGIN}/${seriesId}.webp`,
      chapters: parseWeebCentral(html),
    };
    return { sourceId: "weebcentral", ...feed };
  },
};
