import type { SeriesSourceReader, SourceFeed } from "@/domain/series";
import { SourceBlockedError } from "@/domain/series";
import type { SourceId } from "@/domain/source";
export type Snapshot = Record<string, SourceFeed>;

export function snapshotKey(sourceId: SourceId, reference: string): string {
  return `${sourceId}:${reference}`;
}

async function loadSnapshot(): Promise<Snapshot> {
  return (await import("@/data/snapshot.json")).default as Snapshot;
}

export function createSnapshotReader(sourceId: SourceId): SeriesSourceReader {
  return {
    id: sourceId,
    async read(reference) {
      const feeds = await loadSnapshot();
      const feed = feeds[snapshotKey(sourceId, reference)];
      if (!feed) throw new SourceBlockedError(snapshotKey(sourceId, reference), 404);
      return feed;
    },
  };
}
