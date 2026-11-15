"use client";

import { motion } from "motion/react";

interface KanjiHeadingProps {
  id: string;
  kanji: string;
  label: string;
  korean?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function KanjiHeading({ id, kanji, label, korean }: KanjiHeadingProps) {
  return (
    <h2 id={id} className="inline-flex flex-col items-start">
      <motion.span
        aria-hidden="true"
        lang="ja"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE }}
        className="spaced-kana text-[clamp(2.75rem,7vw,6rem)] leading-[1] font-black"
      >
        {kanji}
      </motion.span>
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        className="mt-3 block h-[5px] w-full origin-left bg-ink"
      />
      <span className="mt-3 text-base font-medium text-ink-muted">
        ({label}
        {korean && (
          <>
            {" · "}
            <span lang="ko">{korean}</span>
          </>
        )}
        )
      </span>
    </h2>
  );
}
