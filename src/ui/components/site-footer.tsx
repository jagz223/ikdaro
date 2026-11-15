"use client";

import Link from "next/link";
import { catalog } from "@/config/catalog";
import { SOURCE_IDS, SOURCE_LABELS } from "@/domain/source";
import { useDictionary } from "@/i18n/use-dictionary";

const SOURCE_HOMES = {
  asura: "https://asurascans.com/comics",
  demonic: "https://demonicscans.org",
  weebcentral: "https://weebcentral.com",
} as const;

export function SiteFooter() {
  const { t } = useDictionary();
  return (
    <footer className="mt-32 px-4 pb-8 sm:px-8">
      <div className="mx-auto grid max-w-[1440px] border-[1.5px] border-ink md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="bg-ink p-8 text-ground sm:p-12">
          <p lang="ko" aria-hidden="true" className="spaced-kana text-[clamp(3.5rem,9vw,8rem)] leading-[0.95] font-black">
            읽다로
          </p>
          <span aria-hidden="true" className="mt-4 block h-[5px] w-full bg-ground" />
          <p className="mt-4 text-base">({t.header.tagline} · <span lang="ko">내 만화 목록</span>)</p>
          <p className="mt-10 max-w-md text-sm leading-relaxed opacity-80">{t.footer.note}</p>
        </div>
        <div className="flex flex-col justify-between gap-10 p-8 sm:p-12">
          <nav aria-label={t.header.tagline} className="flex flex-col gap-3 text-base md:items-end">
            <Link href="/#week-heading" className="link-underline">{t.nav.week}</Link>
            <Link href="/#feed-heading" className="link-underline">{t.nav.latest}</Link>
            {SOURCE_IDS.map((sourceId) => (
              <a key={sourceId} href={SOURCE_HOMES[sourceId]} target="_blank" rel="noopener noreferrer" className="link-underline">
                {SOURCE_LABELS[sourceId].name} ↗
              </a>
            ))}
          </nav>
          <p className="text-sm text-ink-muted md:text-right">
            {t.footer.seriesCount(catalog.length)}
            <br />
            Ikdaro <span lang="ko">읽다로</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
