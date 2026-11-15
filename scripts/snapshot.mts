import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { jobsFor, readPolitely } from "@/application/read-plan";
import { catalog } from "@/config/catalog";
import { liveReaders } from "@/infrastructure/sources/live-readers";
import { snapshotKey, type Snapshot } from "@/infrastructure/sources/snapshot/snapshot-reader";

const OUTPUT_PATH = join(process.cwd(), "src", "data", "snapshot.json");

const results = await readPolitely(jobsFor(catalog), (sourceId, reference) =>
  liveReaders[sourceId].read(reference).then(
    (feed) => ({ status: "ok" as const, sourceId, feed }),
    () => ({ status: "unavailable" as const, sourceId }),
  ),
);
// A blocked source must not wipe the data it had: keep the previous feed for failures.
const previous: Snapshot = existsSync(OUTPUT_PATH) ? JSON.parse(readFileSync(OUTPUT_PATH, "utf8")) : {};
const snapshot: Snapshot = {};
const failures: string[] = [];
for (const [job, result] of results) {
  const key = snapshotKey(job.sourceId, job.reference);
  if (result.status === "ok") snapshot[key] = result.feed;
  else {
    failures.push(key);
    if (previous[key]) snapshot[key] = previous[key];
  }
}

writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot)}\n`);
console.log(`Snapshot: ${Object.keys(snapshot).length} feeds, ${failures.length} failures`);
failures.forEach((failure) => console.warn(`failed: ${failure}`));
