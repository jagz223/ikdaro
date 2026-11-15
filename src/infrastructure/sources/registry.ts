import type { SeriesSourceReader } from "@/domain/series";
import { SOURCE_IDS, type SourceId } from "@/domain/source";
import { liveReaders } from "./live-readers";
import { createSnapshotReader } from "./snapshot/snapshot-reader";

const snapshotReaders = Object.fromEntries(
  SOURCE_IDS.map((id) => [id, createSnapshotReader(id)]),
) as Record<SourceId, SeriesSourceReader>;

export function readerFor(sourceId: SourceId): SeriesSourceReader {
  return process.env.DATA_MODE === "snapshot" ? snapshotReaders[sourceId] : liveReaders[sourceId];
}
