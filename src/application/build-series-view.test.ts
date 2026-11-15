import { describe, expect, it } from "vitest";
import { chapterKey, parseChapterLabel } from "@/domain/chapter-number";
import type { CatalogEntry, SourceFeed } from "@/domain/series";
import { buildSeriesView } from "./build-series-view";

const entry: CatalogEntry = { slug: "demo", title: "Demo", sources: { demonic: "d", asura: "a", weebcentral: "w" } };

const feed = (sourceId: SourceFeed["sourceId"], releasedAt: string, coverUrl?: string): SourceFeed => ({
  sourceId,
  seriesUrl: `https://${sourceId}.test`,
  coverUrl,
  chapters: [{ number: 10, label: "Chapter 10", url: "https://x.test/10", releasedAt }],
});

describe("buildSeriesView", () => {
  it("preselects the source with the newest free release and prefers the asura cover", () => {
    const view = buildSeriesView(entry, [
      { status: "ok", sourceId: "demonic", feed: feed("demonic", "2026-11-10T00:00:00.000Z", "d.jpg") },
      { status: "ok", sourceId: "asura", feed: feed("asura", "2026-11-09T00:00:00.000Z", "a.webp") },
      { status: "unavailable", sourceId: "weebcentral" },
    ]);
    expect(view.defaultSource).toBe("demonic");
    expect(view.coverUrl).toBe("a.webp");
    expect(view.latestReleaseAt).toBe("2026-11-10T00:00:00.000Z");
  });

  it("falls back to the first source when every source is unavailable", () => {
    const view = buildSeriesView(entry, [
      { status: "unavailable", sourceId: "demonic" },
      { status: "unavailable", sourceId: "asura" },
    ]);
    expect(view.defaultSource).toBe("demonic");
    expect(view.latestReleaseAt).toBeUndefined();
  });
});

describe("chapter numbers", () => {
  it("normalises equivalent numbers to one key", () => {
    expect(chapterKey("demo", parseChapterLabel("Chapter 50.0"))).toBe(chapterKey("demo", { number: 50 }));
    expect(chapterKey("demo", parseChapterLabel("Episode 50"))).toBe(chapterKey("demo", { number: 50 }));
    expect(chapterKey("demo", { number: 50.5 })).not.toBe(chapterKey("demo", { number: 50 }));
  });

  it("keeps seasons apart and reads the number after the keyword", () => {
    expect(parseChapterLabel("S3 - Chapter 154")).toEqual({ number: 154, season: 3 });
    expect(parseChapterLabel("S2 - Episode 34")).toEqual({ number: 34, season: 2 });
    expect(chapterKey("demo", { number: 3, season: 2 })).not.toBe(chapterKey("demo", { number: 3, season: 3 }));
  });
});
