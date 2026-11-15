"use client";

import { useState } from "react";

interface CoverProps {
  src?: string;
  title: string;
  className?: string;
  eager?: boolean;
}

export function Cover({ src, title, className = "", eager = false }: CoverProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={title}
        className={`grid place-items-center bg-surface-raised font-myeongjo text-3xl text-ink-faint ${className}`}
      >
        만
      </div>
    );
  }

  return (
    <img
      src={`/api/cover?url=${encodeURIComponent(src)}`}
      alt={title}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
