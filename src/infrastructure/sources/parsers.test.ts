import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseAsura, pickKoreanTitle } from "./asura/asura-reader";
import { parseDemonic } from "./demonic/demonic-reader";
import { parseWeebCentral } from "./weebcentral/weebcentral-reader";

const fixture = (name: string) => readFileSync(join(__dirname, "__fixtures__", name), "utf8");

describe("parseAsura", () => {
  const series = JSON.parse(fixture("asura-series.json"));
  const chapters = JSON.parse(fixture("asura-chapters.json"));

  it("hides premium chapters that are still locked", () => {
    const feed = parseAsura(series, chapters, new Date("2026-11-15T01:00:00Z"));
    expect(feed.chapters[0].number).toBe(250);
    expect(feed.chapters.some((chapter) => chapter.number === 251)).toBe(false);
  });

  it("builds public chapter urls, cover and native title", () => {
    const feed = parseAsura(series, chapters, new Date("2026-11-15T01:00:00Z"));
    expect(feed.chapters[0].url).toBe("https://asurascans.com/comics/doctors-rebirth-f212c582/chapter/250");
    expect(feed.coverUrl).toMatch(/^https:\/\/cdn\.asurascans\.com\//);
    expect(feed.nativeTitle).toMatch(/[가-힣]/);
  });

  it("uses the unlock time as the free release date", () => {
    const feed = parseAsura(series, chapters, new Date("2026-11-15T01:00:00Z"));
    expect(feed.chapters[0].releasedAt).toBe("2026-11-07T23:08:25.209Z");
  });
});

describe("pickKoreanTitle", () => {
  it("takes a pure Korean title out of a bullet-joined list", () => {
    expect(pickKoreanTitle(["양치기 마법사 • Shepherd Wizard • 牧羊巫师", "목동 마법사"])).toBe("양치기 마법사");
  });

  it("ignores mixed or missing titles", () => {
    expect(pickKoreanTitle(["Shepherd 마법사 Wizard"])).toBeUndefined();
    expect(pickKoreanTitle(null)).toBeUndefined();
  });
});

describe("parseDemonic", () => {
  const feed = parseDemonic(fixture("demonic-series.html"), "https://demonicscans.org/manga/Skeleton-Soldier");

  it("reads every chapter newest first with absolute urls", () => {
    expect(feed.chapters.length).toBeGreaterThan(100);
    expect(feed.chapters[0].number).toBeGreaterThan(feed.chapters[1].number);
    expect(feed.chapters.at(-1)).toMatchObject({
      number: 1,
      label: "Chapter 1",
      url: "https://demonicscans.org/chaptered.php?manga=58&chapter=1",
      releasedAt: "2021-04-01T00:00:00.000Z",
    });
  });

  it("encodes the cover url", () => {
    expect(feed.coverUrl).toBe("https://readermc.org/images/thumbnails/Skeleton%20Soldier.jpg");
  });
});

describe("parseWeebCentral", () => {
  const chapters = parseWeebCentral(fixture("weeb-chapters.html"));

  it("reads chapters with dates and absolute urls", () => {
    expect(chapters[0]).toEqual({
      number: 893,
      label: "Chapter 893",
      url: "https://weebcentral.com/chapters/01M6PKD4Y9PM0AEGK525773E9C",
      releasedAt: "2026-11-05T19:36:37.577Z",
    });
    expect(chapters.length).toBeGreaterThan(800);
  });
});
