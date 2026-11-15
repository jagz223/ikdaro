"use client";

import type { Chapter } from "@/domain/series";
import { SOURCE_LABELS, type SourceId } from "@/domain/source";
import { useReadProgress } from "@/features/read-progress/read-progress";
import { isRecent } from "@/features/time/relative-time";
import { useNow } from "@/features/time/use-now";
import { useDictionary } from "@/i18n/use-dictionary";
import { japaneseChapter } from "@/ui/format/east-asian";
import { ReadCheck } from "./read-check";
import { RelativeTime } from "./relative-time";

interface ChapterRowProps {
  seriesSlug: string;
  chapter: Chapter;
  sourceId: SourceId;
  size?: "compact" | "roomy";
}

export function ChapterRow({ seriesSlug, chapter, sourceId, size = "compact" }: ChapterRowProps) {
  const { t } = useDictionary();
  const now = useNow();
  const { isRead, setRead } = useReadProgress();
  const read = isRead(seriesSlug, chapter);
  const name = t.chapter.name(chapter);
  const fresh = !read && isRecent(chapter.releasedAt, now);
  const padding = size === "roomy" ? "py-2.5 px-2 sm:px-3" : "py-1 px-1.5";

  return (
    <div className={`group/row flex items-center gap-3 rounded-md transition-colors hover:bg-surface-raised ${padding}`}>
      <ReadCheck
        checked={read}
        label={read ? t.chapter.markUnread(name) : t.chapter.markRead(name)}
        onChange={(value) => setRead(seriesSlug, chapter, value)}
      />
      <a
        href={chapter.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name}, ${t.chapter.opensIn(SOURCE_LABELS[sourceId].name)}`}
        className="flex min-w-0 flex-1 items-baseline gap-2 rounded-sm sm:gap-2.5"
      >
        <span
          lang="ja"
          className={`shrink-0 font-mincho text-[0.95rem] font-bold sm:text-[1.05rem] transition-colors ${
            read ? "text-ink-faint" : "text-ink group-hover/row:text-lacquer"
          }`}
        >
          {japaneseChapter(chapter)}
        </span>
        <span className={`hidden truncate text-sm sm:inline ${read ? "text-ink-faint" : "text-ink-muted"}`}>{name}</span>
        {fresh && (
          <span className="relative shrink-0 -translate-y-0.5 rounded-[10px] bg-lacquer px-2 py-0.5 text-[0.7rem] leading-none font-black text-lacquer-ink after:absolute after:-bottom-1 after:left-2 after:size-2 after:rotate-45 after:bg-lacquer">
            <span lang="ja">新</span><span className="hidden sm:inline"> {t.chapter.isNew}</span>
          </span>
        )}
        <span aria-hidden="true" className="toc-leader" />
        <RelativeTime
          iso={chapter.releasedAt}
          short={size === "compact"}
          className={`shrink-0 text-xs sm:text-sm ${fresh ? "font-bold text-lacquer" : "text-ink-muted"}`}
        />
      </a>
    </div>
  );
}
