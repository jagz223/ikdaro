import { describe, expect, it } from "vitest";
import type { SeriesView } from "./series";
import { recentReleases } from "./releases";

const chapter = (number: number, releasedAt: string) => ({ number, label: `Chapter ${number}`, url: `u${number}${releasedAt}`, releasedAt });

const view: SeriesView = {
  slug: "demo",
  title: "Demo",
  defaultSource: "weebcentral",
  sources: [
    { status: "ok", sourceId: "demonic", feed: { sourceId: "demonic", seriesUrl: "d", chapters: [chapter(10, "2026-11-13T00:00:00.000Z")] } },
    { status: "ok", sourceId: "weebcentral", feed: { sourceId: "weebcentral", seriesUrl: "w", chapters: [chapter(10, "2026-11-14T06:00:00.000Z"), chapter(9, "2026-11-07T06:00:00.000Z")] } },
  ],
};

describe("recentReleases", () => {
  it("keeps one entry per chapter, from the newest upload, newest first", () => {
    const releases = recentReleases([view]);
    expect(releases.map((release) => [release.chapter.number, release.sourceId])).toEqual([
      [10, "weebcentral"],
      [9, "weebcentral"],
    ]);
  });
});
