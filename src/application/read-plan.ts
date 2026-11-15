import type { CatalogEntry, SourceResult } from "@/domain/series";
import type { SourceId } from "@/domain/source";

const CONCURRENCY_BY_SOURCE: Record<SourceId, number> = { asura: 4, demonic: 3, weebcentral: 1 };

export interface ReadJob {
  slug: string;
  sourceId: SourceId;
  reference: string;
}

export type ReadFn = (sourceId: SourceId, reference: string) => Promise<SourceResult>;

export function jobsFor(entries: CatalogEntry[]): ReadJob[] {
  return entries.flatMap((entry) =>
    (Object.entries(entry.sources) as Array<[SourceId, string]>).map(([sourceId, reference]) => ({
      slug: entry.slug,
      sourceId,
      reference,
    })),
  );
}

async function runQueue(jobs: ReadJob[], limit: number, read: ReadFn): Promise<Array<[ReadJob, SourceResult]>> {
  const results: Array<[ReadJob, SourceResult]> = [];
  const pending = [...jobs];
  const worker = async () => {
    for (let job = pending.shift(); job; job = pending.shift()) {
      results.push([job, await read(job.sourceId, job.reference)]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, jobs.length) }, worker));
  return results;
}

export async function readPolitely(jobs: ReadJob[], read: ReadFn): Promise<Map<ReadJob, SourceResult>> {
  const bySource = Object.entries(CONCURRENCY_BY_SOURCE) as Array<[SourceId, number]>;
  const settled = await Promise.all(
    bySource.map(([sourceId, limit]) => runQueue(jobs.filter((job) => job.sourceId === sourceId), limit, read)),
  );
  return new Map(settled.flat());
}
