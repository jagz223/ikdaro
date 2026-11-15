import { describe, expect, it } from "vitest";
import type { CatalogEntry } from "@/domain/series";
import { jobsFor, readPolitely } from "./read-plan";

const entries: CatalogEntry[] = Array.from({ length: 6 }, (_, index) => ({
  slug: `s${index}`,
  title: `S${index}`,
  sources: { weebcentral: `w${index}`, asura: `a${index}` },
}));

describe("readPolitely", () => {
  it("never runs two weeb central reads at once and keeps every result", async () => {
    let active = 0;
    let peak = 0;
    const results = await readPolitely(jobsFor(entries), async (sourceId, reference) => {
      if (sourceId === "weebcentral") {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 5));
        active -= 1;
      }
      if (reference === "a3") return { status: "unavailable", sourceId };
      return { status: "ok", sourceId, feed: { sourceId, seriesUrl: reference, chapters: [] } };
    });

    expect(peak).toBe(1);
    expect(results.size).toBe(12);
    const failed = [...results].find(([job]) => job.reference === "a3")?.[1];
    expect(failed).toEqual({ status: "unavailable", sourceId: "asura" });
  });
});
