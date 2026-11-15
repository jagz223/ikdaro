import { cacheLife } from "next/cache";
import type { SourceResult } from "@/domain/series";
import type { SourceId } from "@/domain/source";
import { readerFor } from "@/infrastructure/sources/registry";

export async function readSource(sourceId: SourceId, reference: string): Promise<SourceResult> {
  "use cache";
  try {
    const feed = await readerFor(sourceId).read(reference);
    cacheLife("sources");
    return { status: "ok", sourceId, feed };
  } catch {
    cacheLife("sourceFailure");
    return { status: "unavailable", sourceId };
  }
}
