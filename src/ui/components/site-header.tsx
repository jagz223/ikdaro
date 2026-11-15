"use client";

import Link from "next/link";
import { useLanguage, useTheme } from "@/features/preferences/preferences";
import { useDictionary } from "@/i18n/use-dictionary";
import { HankoMark } from "./hanko-mark";

function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const { t } = useDictionary();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t.header.toLight : t.header.toDark}
      className="group flex cursor-pointer items-baseline gap-1.5 text-sm font-medium"
    >
      <span lang="ja" aria-hidden="true" className="font-mincho text-base font-bold transition-colors group-hover:text-lacquer">
        {isDark ? "月" : "日"}
      </span>
      <span className="link-underline">{isDark ? t.nav.dark : t.nav.light}</span>
    </button>
  );
}

function LanguageToggle() {
  const [language, setLanguage] = useLanguage();
  const { t } = useDictionary();
  return (
    <div role="group" aria-label={t.header.language} className="flex items-baseline gap-1 text-sm font-medium">
      {(["es", "en"] as const).map((option, index) => (
        <span key={option} className="flex items-baseline gap-1">
          {index > 0 && <span aria-hidden="true" className="text-ink-faint">/</span>}
          <button
            type="button"
            aria-pressed={option === language}
            onClick={() => setLanguage(option)}
            className={`cursor-pointer px-0.5 transition-colors ${
              option === language ? "font-bold text-ink underline decoration-2 underline-offset-[0.35em]" : "text-ink-muted hover:text-ink"
            }`}
          >
            {option.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const { t } = useDictionary();
  return (
    <header className="sticky top-0 z-40 bg-ground/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:h-18 sm:px-8">
        <Link href="/" aria-label={t.header.home} className="group flex items-center gap-3">
          <HankoMark className="size-9 transition-transform duration-500 ease-[var(--ease-ink)] group-hover:rotate-[4deg]" />
          <span className="flex items-baseline gap-1.5 text-lg leading-none">
            <span className="font-medium tracking-[0.02em]">ikdaro</span>
            <span aria-hidden="true" className="text-ink-faint">/</span>
            <span lang="ko" className="font-mincho font-bold">읽다로</span>
          </span>
        </Link>
        <nav aria-label={t.header.tagline} className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/#week-heading" className="link-underline">
            {t.nav.week}
          </Link>
          <Link href="/#feed-heading" className="link-underline">
            {t.nav.latest}
          </Link>
        </nav>
        <div className="flex items-center gap-5">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
