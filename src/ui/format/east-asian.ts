import type { ChapterIdentity } from "@/domain/chapter-number";

const HANGUL_PATTERN = /[가-힣]/;

export const KOREAN_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function koreanChapter(chapter: ChapterIdentity): string {
  const season = chapter.season ? `시즌${chapter.season} ` : "";
  return `${season}${chapter.number}화`;
}

export function scriptOf(text: string | undefined): "ko" | "ja" {
  return text && HANGUL_PATTERN.test(text) ? "ko" : "ja";
}
