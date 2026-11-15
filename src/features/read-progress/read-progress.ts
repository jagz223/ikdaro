"use client";

import { useCallback } from "react";
import { chapterKey, type ChapterIdentity } from "@/domain/chapter-number";
import { createPersistentStore, usePersistentStore } from "@/features/persistent-store";

type ReadMap = Readonly<Record<string, true>>;

const EMPTY: ReadMap = Object.freeze({});

const readStore = createPersistentStore<ReadMap>({
  key: "manrok:read:v1",
  serverValue: EMPTY,
  fallback: () => EMPTY,
  parse: (raw) => {
    try {
      const parsed: unknown = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as ReadMap) : undefined;
    } catch {
      return undefined;
    }
  },
  serialize: (value) => (Object.keys(value).length ? JSON.stringify(value) : null),
});

export function useReadProgress() {
  const read = usePersistentStore(readStore);

  const isRead = useCallback(
    (seriesSlug: string, chapter: ChapterIdentity) => chapterKey(seriesSlug, chapter) in read,
    [read],
  );

  const setRead = useCallback((seriesSlug: string, chapter: ChapterIdentity, value: boolean) => {
    const key = chapterKey(seriesSlug, chapter);
    const current = readStore.getSnapshot();
    if (value) {
      readStore.set({ ...current, [key]: true });
      return;
    }
    const { [key]: _removed, ...rest } = current;
    readStore.set(rest);
  }, []);

  return { isRead, setRead };
}
